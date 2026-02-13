import { spawn } from "child_process";
import { CommandExecutor, CommandResult } from "./types.js";

export class LocalExecutor implements CommandExecutor {
  async execute(command: string, workingDirectory: string, timeout: number): Promise<CommandResult> {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let resolved = false;

      const isWindows = process.platform === "win32";
      const shell = isWindows ? "cmd.exe" : "/bin/bash";
      const shellArgs = isWindows ? ["/c", command] : ["-c", command];

      const child = spawn(shell, shellArgs, {
        cwd: workingDirectory,
        env: { ...process.env },
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
}
