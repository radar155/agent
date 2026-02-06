import { tool } from "langchain";
import { z } from "zod";
import { FileService } from "../../services/FileService.js";

const fileService = new FileService();

export const createFileTool = tool(
  async ({ path, description, content }: { path: string; description: string; content: string }) => {
    const result = fileService.createFile(path, content);
    return JSON.stringify({
      success: result.success,
      message: result.success ? result.output : result.error,
      path,
      description,
    });
  },
  {
    name: "create_file",
    description:
      "Create a new file with specified content. Provide path and description first, then content.",
    schema: z.object({
      path: z.string().describe("Path to file (relative to workspace)"),
      description: z.string().describe("Brief description of what this file does/contains"),
      content: z.string().describe("Content to write to the file"),
    }),
  }
);
