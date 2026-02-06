import { tool } from "langchain";
import { z } from "zod";
import * as fs from "fs";
import { FileService } from "../../services/FileService.js";

const fileService = new FileService();

export const viewTool = tool(
  async ({ path }: { path: string }) => {
    try {
      const targetPath = path || ".";
      let resolvedPath: string;

      try {
        resolvedPath = (fileService as any).validatePath(targetPath);
      } catch {
        if (targetPath === "." || targetPath === "") {
          resolvedPath = fileService.getWorkspacePath();
        } else {
          throw new Error(`Invalid path: ${targetPath}`);
        }
      }

      if (!fs.existsSync(resolvedPath)) {
        return JSON.stringify({ success: false, type: "error", error: `Path not found: ${path}` });
      }

      const stats = fs.statSync(resolvedPath);

      if (stats.isDirectory()) {
        const result = fileService.listDirectory(targetPath === "." ? "" : targetPath);
        return JSON.stringify({
          success: result.success,
          type: "directory",
          path: targetPath,
          content: result.success ? result.output : "",
          error: result.error,
        });
      } else {
        const result = fileService.readFile(targetPath);
        return JSON.stringify({
          success: result.success,
          type: "file",
          path: targetPath,
          content: result.success ? result.output : "",
          error: result.error,
        });
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "view",
    description:
      "View file contents or list directory contents. Automatically detects if path is a file or directory. Use '.' or empty string for workspace root.",
    schema: z.object({
      path: z.string().describe("Path to file or directory (relative to workspace)"),
    }),
  }
);
