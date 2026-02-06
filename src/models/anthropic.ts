import { ChatAnthropic } from "@langchain/anthropic";

export const createAnthropicModel = () =>
  new ChatAnthropic({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
