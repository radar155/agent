import { parseOpenAIStream } from "./openaiStreamParser.js";
import { parseAnthropicStream } from "./anthropicStreamParser.js";
import type { StreamCallbacks } from "./types.js";
import type { ModelProvider } from "../models/index.js";

export type { StreamCallbacks } from "./types.js";
export { parseOpenAIStream } from "./openaiStreamParser.js";
export { parseAnthropicStream } from "./anthropicStreamParser.js";

/**
 * Seleziona e esegue il parser appropriato in base al provider.
 */
export async function parseAgentStream(
  stream: AsyncIterable<[string, unknown]>,
  callbacks: StreamCallbacks,
  provider?: ModelProvider
) {
  const modelProvider = provider || (process.env.MODEL_PROVIDER as ModelProvider) || "openai";

  if (modelProvider === "anthropic") {
    return parseAnthropicStream(stream, callbacks);
  }
  return parseOpenAIStream(stream, callbacks);
}
