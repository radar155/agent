import { spawn } from "child_process";
import * as fs from "fs";
import { config } from "./config.js";

export interface BashResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut?: boolean;
}

export class BashSandbox {
  private workingDirectory: string;
  private timeout: number;
  private blacklist: string[];

  constructor(options?: {
    workingDirectory?: string;
    timeout?: number;
    blacklist?: string[];
  }) {
    this.workingDirectory = options?.workingDirectory ?? config.sandbox.workingDirectory;
    this.timeout = options?.timeout ?? config.sandbox.timeout;
    this.blacklist = options?.blacklist ?? config.sandbox.blacklist;
  }

  isBlacklisted(command: string): boolean {
    const normalized = command.toLowerCase().replace(/\s+/g, " ").trim();
    return this.blacklist.some((pattern) =>
      normalized.includes(pattern.toLowerCase().replace(/\s+/g, " ").trim())
    );
  }

  private ensureWorkingDirectory(): void {
    if (!fs.existsSync(this.workingDirectory)) {
      fs.mkdirSync(this.workingDirectory, { recursive: true });
    }
  }

  async execute(command: string): Promise<BashResult> {
    if (this.isBlacklisted(command)) {
      return {
        stdout: "",
        stderr: "Error: Command rejected - matches blacklisted pattern",
        exitCode: 1,
        timedOut: false,
      };
    }

    this.ensureWorkingDirectory();

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let resolved = false;

      const isWindows = process.platform === "win32";
      const shell = isWindows ? "cmd.exe" : "/bin/bash";
      const shellArgs = isWindows ? ["/c", command] : ["-c", command];

      const child = spawn(shell, shellArgs, {
        cwd: this.workingDirectory,
        env: { ...process.env },
        stdio: ["pipe", "pipe", "pipe"],
      });

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          timedOut = true;
          child.kill("SIGKILL");
        }
      }, this.timeout);

      child.stdout.on("data", (data) => (stdout += data.toString()));
      child.stderr.on("data", (data) => (stderr += data.toString()));

      child.on("close", (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({
            stdout,
            stderr: timedOut
              ? stderr + `\nError: Command timed out after ${this.timeout / 1000} seconds`
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

  getWorkingDirectory(): string {
    return this.workingDirectory;
  }
}
