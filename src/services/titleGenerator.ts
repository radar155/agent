import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

function createTitleModel() {
  const provider = process.env.MODEL_PROVIDER || "anthropic";
  if (provider === "openai") {
    return new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 30,
    });
  }
  return new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 30,
  });
}

const titleModel = createTitleModel();

export async function generateTitle(userMessage: string): Promise<string> {
  try {
    const response = await titleModel.invoke([
      {
        role: "system",
        content: "Generate a very short title (max 6 words) for a conversation that starts with the following user message. Reply with ONLY the title, no quotes, no punctuation at the end. Use the same language as the user message.",
      },
      { role: "user", content: userMessage },
    ]);
    const title = typeof response.content === "string"
      ? response.content.trim()
      : String(response.content).trim();
    return title.slice(0, 80);
  } catch (err) {
    console.error("Title generation failed:", err);
    return userMessage.slice(0, 40);
  }
}
