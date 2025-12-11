import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { model } from "./model";
import { tools } from "./tools";
import { mcpTools } from "./mcpTools";

const checkpointer = new MemorySaver();

export const agent = createAgent({
  model,
  systemPrompt: "Sei un assistente generico",
  tools: [...tools, ...mcpTools],
  checkpointer,
});
