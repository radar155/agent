import { createOpenAIModel } from "./openai.js";
import { createAnthropicModel } from "./anthropic.js";

export type ModelProvider = "openai" | "anthropic";

export const createModel = () => {
  const provider = (process.env.MODEL_PROVIDER || "anthropic") as ModelProvider;

  switch (provider) {
    case "anthropic":
      return createAnthropicModel();
    case "openai":
    default:
      return createOpenAIModel();
  }
};

export { createOpenAIModel, createAnthropicModel };
