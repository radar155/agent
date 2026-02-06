import { tool } from "langchain";
import { z } from "zod";
import { FileService } from "../../services/FileService.js";

const fileService = new FileService();

export const strReplaceTool = tool(
  async ({ path, old_str, new_str }: { path: string; old_str: string; new_str: string }) => {
    const result = fileService.replaceInFile(path, old_str, new_str);
    return JSON.stringify({
      success: result.success,
      message: result.success ? result.output : result.error,
      path,
    });
  },
  {
    name: "str_replace",
    description:
      "Replace a string in a file. Finds the first occurrence of old_str and replaces it with new_str.",
    schema: z.object({
      path: z.string().describe("Path to file (relative to workspace)"),
      old_str: z.string().describe("String to find and replace"),
      new_str: z.string().describe("Replacement string"),
    }),
  }
);
