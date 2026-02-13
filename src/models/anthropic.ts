import { ChatAnthropic } from "@langchain/anthropic";

export const createAnthropicModel = () => {
  const thinking = process.env.ANTHROPIC_THINKING === "true";
  const budgetTokens = parseInt(process.env.ANTHROPIC_THINKING_BUDGET || "8000", 10);

  return new ChatAnthropic({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    apiKey: process.env.ANTHROPIC_API_KEY,
    ...(thinking && {
      thinking: { type: "enabled" as const, budget_tokens: budgetTokens },
      maxTokens: Math.max(budgetTokens + 4096, 16000),
    }),
  });
};
