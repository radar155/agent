import { config } from "./services/config.js";
import { createExecutor } from "./services/executors/index.js";

/**
 * Initialize all required services before the application starts.
 * Throws and exits if critical services (e.g. Docker container) fail to start.
 */
export async function bootstrap(): Promise<void> {
  if (config.sandbox.mode === "docker") {
    console.log("🐳 Sandbox mode: docker");
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
