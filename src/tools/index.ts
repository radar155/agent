import { sandboxTools } from "./sandbox/index.js";
import { chartTool } from "./chartTool.js";
import { htmlRenderTool } from "./htmlRenderTool.js";
import { webFetchTool } from "./webFetchTool.js";

export const tools = [...sandboxTools, chartTool, htmlRenderTool, webFetchTool];

// Re-export per accesso individuale
export { sandboxTools } from "./sandbox/index.js";
export { chartTool } from "./chartTool.js";
export { htmlRenderTool } from "./htmlRenderTool.js";
export { webFetchTool } from "./webFetchTool.js";
