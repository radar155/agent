import { ChatOpenAI } from "@langchain/openai";

export const createOpenAIModel = () =>
  new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
  });
