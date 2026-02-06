import type { StreamCallbacks } from "./types.js";

/**
 * Parser per stream di agenti LangChain con modelli OpenAI.
 * Gestisce: token streaming, tool calls, tool results.
 */
export async function parseOpenAIStream(
  stream: AsyncIterable<[string, unknown]>,
  callbacks: StreamCallbacks
) {
  const toolNames = new Map<string, string>();

  try {
    for await (const [mode, chunk] of stream) {
      if (mode === "messages") {
        parseMessagesChunk(chunk, callbacks);
      } else if (mode === "updates") {
        parseUpdatesChunk(chunk, callbacks, toolNames);
      }
    }
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

function parseMessagesChunk(chunk: unknown, callbacks: StreamCallbacks) {
  const [messageChunk, metadata] = chunk as [any, any];

  // Solo messaggi dal nodo model
  if (metadata?.langgraph_node !== "model" && metadata?.langgraph_node !== "model_request") {
    return;
  }

  const content = messageChunk?.content || messageChunk?.kwargs?.content;
  if (typeof content === "string" && content) {
    callbacks.onToken(content);
  }
}

function parseUpdatesChunk(
  chunk: unknown,
  callbacks: StreamCallbacks,
  toolNames: Map<string, string>
) {
  const data = chunk as Record<string, any>;

  // Formato con model_request (vecchio)
  if (data.model_request) {
    const msg = data.model_request.messages?.[0];
    const toolCalls = msg?.tool_calls || msg?.kwargs?.tool_calls;
    if (Array.isArray(toolCalls)) {
      for (const tc of toolCalls) {
        if (tc.id && tc.name) {
          toolNames.set(tc.id, tc.name);
          callbacks.onToolCall(tc.id, tc.name, tc.args || {});
        }
      }
    }
  }

  // Formato con model (nuovo)
  if (data.model) {
    const messages = data.model.messages;
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        const kwargs = msg?.kwargs || msg;
        const toolCalls = kwargs.tool_calls;
        if (Array.isArray(toolCalls)) {
          for (const tc of toolCalls) {
            if (tc.id && tc.name) {
              toolNames.set(tc.id, tc.name);
              callbacks.onToolCall(tc.id, tc.name, tc.args || {});
            }
          }
        }
      }
    }
  }

  // Tool results
  if (data.tools) {
    for (const msg of data.tools.messages || []) {
      const kwargs = msg?.kwargs || msg;
      const content = kwargs.content;
      const toolCallId = kwargs.tool_call_id;
      const name = kwargs.name || toolNames.get(toolCallId) || "";

      if (content !== undefined && toolCallId) {
        callbacks.onToolResult(toolCallId, name, String(content));
      }
    }
  }
}
