import { createAgent } from "langchain";
import { model } from "./model";
import { tools } from "./tools";
import { mcpTools } from "./mcpTools";
import { createCheckpointer } from "./memory";

const checkpointer = await createCheckpointer();

export const agent = createAgent({
  model,
  systemPrompt: "Sei un assistente esperto di installazione di pannelli fotovoltaici. Hai molti tool a disposizione. Usali e suggerisci all'utente operazioni interessanti che può fare con questi tool, sii propositivo e non solo passivo",
  tools: [...tools, ...mcpTools],
  checkpointer,
});
