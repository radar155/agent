import { tool } from "langchain";
import { z } from "zod";
import * as path from "path";
import { FileService } from "../services/FileService.js";

const fileService = new FileService();

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".txt": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".csv": "text/csv",
    ".md": "text/markdown",
    ".ts": "text/typescript",
    ".py": "text/x-python",
    ".exe": "application/octet-stream",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export const presentFilesTool = tool(
  async ({ paths }: { paths: string[] }): Promise<string> => {
    const files: Array<{ filename: string; downloadUrl: string; mimeType: string }> = [];
    const errors: string[] = [];

    for (const filePath of paths) {
      const result = fileService.copyToOutputs(filePath);
      if (result.success) {
        const filename = path.basename(filePath);
        files.push({
          filename,
          downloadUrl: result.output,
          mimeType: getMimeType(filename),
        });
      } else {
        errors.push(`${filePath}: ${result.error}`);
      }
    }

    return JSON.stringify({
      success: errors.length === 0,
      files,
      errors: errors.length > 0 ? errors : undefined,
    });
  },
  {
    name: "present_files",
    description: "Make files available for download. Copies files to outputs directory and returns download URLs.",
    schema: z.object({
      paths: z.array(z.string()).describe("Array of file paths to present for download (relative to workspace)"),
    }),
  }
);
