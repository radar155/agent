import { config } from "../services/config.js";
import type { StructuredToolInterface } from "@langchain/core/tools";

const tools: StructuredToolInterface[] = [];

// Sandbox tools: bash, view, create_file, str_replace, present_files
if (config.tools.sandbox) {
  const { bashTool } = await import("./sandbox/bashTool.js");
  const { viewTool } = await import("./sandbox/viewTool.js");
  const { createFileTool } = await import("./sandbox/createFileTool.js");
  const { strReplaceTool } = await import("./sandbox/strReplaceTool.js");
  const { presentFilesTool } = await import("./presentFilesTool.js");
  tools.push(bashTool, viewTool, createFileTool, strReplaceTool, presentFilesTool);
}

// Web tools: web_fetch
if (config.tools.web) {
  const { webFetchTool } = await import("./webFetchTool.js");
  tools.push(webFetchTool);
}

// Output tools: chart, html_render
if (config.tools.output) {
  const { chartTool } = await import("./chartTool.js");
  const { htmlRenderTool } = await import("./htmlRenderTool.js");
  tools.push(chartTool, htmlRenderTool);
}

export { tools };
