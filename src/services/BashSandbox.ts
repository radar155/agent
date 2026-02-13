import * as fs from "fs";
import { config } from "./config.js";
import { createExecutor, CommandExecutor, CommandResult } from "./executors/index.js";

export type { CommandResult };

export class BashSandbox {
  private workingDirectory: string;
  private timeout: number;
  private blacklist: string[];
  private executor: CommandExecutor;

  constructor(options?: {
    workingDirectory?: string;
    timeout?: number;
    blacklist?: string[];
  }) {
    this.workingDirectory = options?.workingDirectory ?? config.sandbox.workingDirectory;
    this.timeout = options?.timeout ?? config.sandbox.timeout;
    this.blacklist = options?.blacklist ?? config.sandbox.blacklist;
    // Singleton executor — already initialized by bootstrap()
    this.executor = createExecutor();
  }

  isBlacklisted(command: string): boolean {
    if (this.blacklist.length === 0) return false;
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

  async execute(command: string): Promise<CommandResult> {
    if (this.isBlacklisted(command)) {
      return {
        stdout: "",
        stderr: "Error: Command rejected - matches blacklisted pattern",
        exitCode: 1,
        timedOut: false,
      };
    }

    this.ensureWorkingDirectory();

    return this.executor.execute(command, this.workingDirectory, this.timeout);
  }

  getWorkingDirectory(): string {
    return this.workingDirectory;
  }

  async dispose(): Promise<void> {
    if (this.executor.dispose) {
      await this.executor.dispose();
    }
  }
}
