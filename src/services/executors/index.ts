import { CommandExecutor } from "./types.js";
import { LocalExecutor } from "./LocalExecutor.js";
import { DockerExecutor } from "./DockerExecutor.js";
import { config } from "../config.js";

export type { CommandExecutor, CommandResult } from "./types.js";

let _instance: CommandExecutor | null = null;

/**
 * Returns a singleton CommandExecutor based on SANDBOX_MODE config.
 * The same instance is shared between bootstrap and BashSandbox.
 */
export function createExecutor(): CommandExecutor {
  if (!_instance) {
    _instance = config.sandbox.mode === "docker"
      ? new DockerExecutor()
      : new LocalExecutor();
  }
  return _instance;
}
