import { createAgent } from "langchain";
import { createModel } from "./models/index.js";
import { tools } from "./tools/index.js";
import { createCheckpointer } from "./memory";
import { generateSystemPrompt } from "./systemPrompt.js";

const checkpointer = await createCheckpointer();
const model = createModel();

export const agent = createAgent({
  model,
  systemPrompt: generateSystemPrompt(),
  tools,
  checkpointer,
});
