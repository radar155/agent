import { createAgent } from "langchain";
import { model } from "./model";
import { tools } from "./tools";
import { mcpTools } from "./mcpTools";
import { createCheckpointer } from "./memory";

const checkpointer = await createCheckpointer();

export const agent = createAgent({
  model,
  systemPrompt: "Sei un agente capace di generare dei comandi che vengono recepiti da una user interface che cambia il suo aspetto in base ad essi.",
  tools: [...tools],
  checkpointer,
});
