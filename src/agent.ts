import { createAgent } from "langchain";
import { createModel } from "./models/index.js";
import { tools } from "./tools/index.js";
import { createCheckpointer } from "./memory";

const checkpointer = await createCheckpointer();
const model = createModel();

export const agent = createAgent({
  model,
  systemPrompt: "Sei un assistente generico. Rispondi in modo gentile e conciso.",
  tools,
  checkpointer,
});
