export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut?: boolean;
}

export interface CommandExecutor {
  execute(command: string, workingDirectory: string, timeout: number): Promise<CommandResult>;
  /** Initialize the executor (e.g. start/ensure container). No-op for local. */
  init?(): Promise<void>;
  /** Cleanup resources (e.g. stop container). No-op for local. */
  dispose?(): Promise<void>;
}
