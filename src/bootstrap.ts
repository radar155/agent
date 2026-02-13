import { config } from "./services/config.js";

/**
 * Initialize all required services before the application starts.
 * Only starts Docker container when sandbox tools are enabled and mode is "docker".
 */
export async function bootstrap(): Promise<void> {
  if (!config.tools.sandbox) {
    console.log("🔧 Sandbox tools disabled, skipping sandbox initialization");
    return;
  }

  if (config.sandbox.mode === "docker") {
    console.log("🐳 Sandbox mode: docker");
    const { createExecutor } = await import("./services/executors/index.js");
    const executor = createExecutor();
    try {
      await executor.init!();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to start Docker sandbox: ${msg}`);
      console.error("Make sure Docker is running and the image has been built:");
      console.error("  docker compose build");
      process.exit(1);
    }
  } else {
    console.log("📁 Sandbox mode: local");
  }
}
