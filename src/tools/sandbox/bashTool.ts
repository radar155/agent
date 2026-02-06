import { tool } from "langchain";
import { z } from "zod";
import { BashSandbox } from "../../services/BashSandbox.js";

const sandbox = new BashSandbox();

export const bashTool = tool(
  async ({ command }: { command: string }) => {
    const result = await sandbox.execute(command);
    return JSON.stringify({
      success: result.exitCode === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      timedOut: result.timedOut || false,
      workingDirectory: sandbox.getWorkingDirectory(),
    });
  },
  {
    name: "bash",
    description:
      "Execute a bash/shell command in a sandboxed environment. Returns stdout, stderr, and exit code. Commands run in an isolated workspace with a 30-second timeout. Dangerous commands are blocked.",
    schema: z.object({
      command: z.string().describe("The shell command to execute"),
    }),
  }
);
