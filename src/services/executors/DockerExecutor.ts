import { spawn, execSync } from "child_process";
import * as path from "path";
import { CommandExecutor, CommandResult } from "./types.js";
import { config } from "../config.js";

export class DockerExecutor implements CommandExecutor {
  private containerName: string;
  private imageName: string;
  private hostWorkspacePath: string;
  private containerWorkspacePath: string;

  constructor() {
    this.containerName = config.docker.containerName;
    this.imageName = config.docker.imageName;
    this.hostWorkspacePath = config.docker.hostWorkspacePath;
    this.containerWorkspacePath = config.docker.containerWorkspacePath;
  }

  async init(): Promise<void> {
    if (this.isContainerRunning()) {
      console.log(`🐳 Docker container "${this.containerName}" is already running.`);
      return;
    }

    if (this.containerExists()) {
      console.log(`🐳 Starting existing container "${this.containerName}"...`);
      execSync(`docker start ${this.containerName}`, { stdio: "pipe" });
    } else {
      // Container doesn't exist — create it via docker compose if available, else docker run
      console.log(`🐳 Creating container "${this.containerName}"...`);
      try {
        execSync("docker compose up -d", { stdio: "pipe", cwd: path.resolve(".") });
      } catch {
        // Fallback: create container directly with docker run
        console.log(`🐳 docker compose failed, falling back to docker run...`);
        const cmd = [
          "docker", "run", "-d",
          "--name", this.containerName,
          "-v", `"${this.hostWorkspacePath}:${this.containerWorkspacePath}"`,
          "-w", this.containerWorkspacePath,
          this.imageName,
          "tail", "-f", "/dev/null",
        ].join(" ");
        execSync(cmd, { stdio: "pipe" });
      }
    }

    // Verify the container is actually running
    if (!this.isContainerRunning()) {
      throw new Error(`Container "${this.containerName}" was created but is not running.`);
    }

    console.log(`🐳 Container "${this.containerName}" is ready.`);
  }

  async dispose(): Promise<void> {
    if (this.isContainerRunning()) {
      console.log(`🐳 Stopping container "${this.containerName}"...`);
      execSync(`docker stop ${this.containerName}`, { stdio: "pipe" });
    }
  }

  async execute(command: string, workingDirectory: string, timeout: number): Promise<CommandResult> {
    // Map host workspace path to container workspace path
    const containerCwd = this.toContainerPath(workingDirectory);

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let resolved = false;

      const child = spawn("docker", [
        "exec",
        "-w", containerCwd,
        this.containerName,
        "/bin/bash", "-c", command,
      ], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          timedOut = true;
          child.kill("SIGKILL");
        }
      }, timeout);

      child.stdout.on("data", (data) => (stdout += data.toString()));
      child.stderr.on("data", (data) => (stderr += data.toString()));

      child.on("close", (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr: timedOut
              ? stderr + `\nError: Command timed out after ${timeout / 1000} seconds`
              : stderr,
            exitCode: timedOut ? 124 : (code ?? 1),
            timedOut,
          });
        }
      });

      child.on("error", (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr: `Error: ${error.message}`,
            exitCode: 1,
            timedOut: false,
          });
        }
      });
    });
  }

  private toContainerPath(hostPath: string): string {
    const resolvedHost = path.resolve(hostPath);
    const resolvedWorkspace = path.resolve(this.hostWorkspacePath);

    if (resolvedHost.startsWith(resolvedWorkspace)) {
      const relative = path.relative(resolvedWorkspace, resolvedHost);
      return relative
        ? `${this.containerWorkspacePath}/${relative}`.replace(/\\/g, "/")
        : this.containerWorkspacePath;
    }

    // Fallback: use container workspace root
    return this.containerWorkspacePath;
  }

  private isContainerRunning(): boolean {
    try {
      const result = execSync(
        `docker inspect --type container -f "{{.State.Running}}" ${this.containerName}`,
        { stdio: "pipe" }
      ).toString().trim();
      return result === "true";
    } catch {
      return false;
    }
  }

  private containerExists(): boolean {
    try {
      execSync(`docker inspect --type container ${this.containerName}`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }
}
