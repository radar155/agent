import type { StreamCallbacks } from "./types.js";

type ModelProvider = "openai" | "anthropic";

/**
 * Configurazione per-provider: l'unica differenza è il nome del campo
 * "thinking" usato nei content blocks e nei messaggi completi.
 */
interface ProviderConfig {
  /** Nome del campo thinking/reasoning nei content blocks */
  thinkingType: string;
  /** Nome del campo che contiene il testo di thinking */
  thinkingField: string;
}

const PROVIDER_CONFIG: Record<ModelProvider, ProviderConfig> = {
  anthropic: { thinkingType: "thinking", thinkingField: "thinking" },
  openai: { thinkingType: "reasoning", thinkingField: "reasoning" },
};

interface ParserState {
  toolNames: Map<string, string>;
  partialArgsBuffer: Map<string, string>;
  lastEmittedArgs: Map<string, string>;
  indexToId: Map<number, string>;
  indexToName: Map<number, string>;
}

/**
 * Parser unificato per stream LangGraph con qualsiasi provider.
 * Gestisce: token streaming, tool call incrementali, thinking/reasoning, tool results.
 */
export async function parseAgentStream(
  stream: AsyncIterable<[string, unknown]>,
  callbacks: StreamCallbacks,
  provider?: ModelProvider
) {
  const modelProvider = provider || (process.env.MODEL_PROVIDER as ModelProvider) || "openai";
  const cfg = PROVIDER_CONFIG[modelProvider] || PROVIDER_CONFIG.openai;

  const state: ParserState = {
    toolNames: new Map(),
    partialArgsBuffer: new Map(),
    lastEmittedArgs: new Map(),
    indexToId: new Map(),
    indexToName: new Map(),
  };

  try {
    for await (const [mode, chunk] of stream) {
      if (mode === "messages") {
        parseMessagesChunk(chunk, callbacks, state, cfg);
      } else if (mode === "updates") {
        parseUpdatesChunk(chunk, callbacks, state, cfg);
      }
    }
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}


// ── Messages chunk parsing ──────────────────────────────────────────

function parseMessagesChunk(
  chunk: unknown,
  callbacks: StreamCallbacks,
  state: ParserState,
  cfg: ProviderConfig
) {
  const [messageChunk, metadata] = chunk as [any, any];

  const nodeType = metadata?.langgraph_node;
  if (nodeType !== "model" && nodeType !== "model_request") return;

  const kwargs = messageChunk?.kwargs || messageChunk;

  // Tool call chunks incrementali (identici per tutti i provider)
  const toolCallChunks = kwargs?.tool_call_chunks;
  if (Array.isArray(toolCallChunks) && toolCallChunks.length > 0) {
    handleToolCallChunks(toolCallChunks, callbacks, state);
  }

  // Content testuale semplice
  const content = kwargs?.content;
  if (typeof content === "string" && content) {
    callbacks.onToken(content);
    return;
  }

  // contentBlocks (thinking/reasoning + text)
  const contentBlocks = messageChunk?.contentBlocks;
  if (Array.isArray(contentBlocks)) {
    for (const block of contentBlocks) {
      if (block.type === cfg.thinkingType && block[cfg.thinkingField]) {
        callbacks.onThinking?.(block[cfg.thinkingField]);
      } else if (block.type === "text" && block.text) {
        callbacks.onToken(block.text);
      }
    }
    return;
  }

  // Content come array
  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item === "string") {
        callbacks.onToken(item);
      } else if (item?.type === "text" && item.text) {
        callbacks.onToken(item.text);
      } else if (item?.type === cfg.thinkingType && item[cfg.thinkingField]) {
        callbacks.onThinking?.(item[cfg.thinkingField]);
      }
    }
  }
}

// ── Updates chunk parsing ───────────────────────────────────────────

function parseUpdatesChunk(
  chunk: unknown,
  callbacks: StreamCallbacks,
  state: ParserState,
  cfg: ProviderConfig
) {
  const data = chunk as Record<string, any>;

  const modelData = data.model || data.model_request;
  if (modelData) {
    const messages = modelData.messages;
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        const kwargs = msg?.kwargs || msg;

        // OpenAI reasoning in additional_kwargs (o1/o3 summary format)
        const reasoningSummary = kwargs.additional_kwargs?.reasoning?.summary;
        if (Array.isArray(reasoningSummary)) {
          const text = reasoningSummary
            .filter((item: any) => item.type === "summary_text")
            .map((item: any) => item.text)
            .join("");
          if (text.trim()) {
            callbacks.onThinking?.(text);
          }
        }

        // Thinking/reasoning nei content blocks dei messaggi completi
        if (Array.isArray(kwargs.content)) {
          for (const block of kwargs.content) {
            if (block?.type === cfg.thinkingType && block[cfg.thinkingField]) {
              callbacks.onThinking?.(block[cfg.thinkingField]);
            }
          }
        }

        // Tool calls completi
        const toolCalls = kwargs.tool_calls;
        if (Array.isArray(toolCalls) && toolCalls.length > 0) {
          for (const tc of toolCalls) {
            if (tc.id && tc.name) {
              state.toolNames.set(tc.id, tc.name);
              callbacks.onToolCall(tc.id, tc.name, tc.args || {}, true);
              state.partialArgsBuffer.delete(tc.id);
              state.lastEmittedArgs.delete(tc.id);
            }
          }
        }
      }
    }
  }

  // Tool results
  if (data.tools?.messages) {
    for (const msg of data.tools.messages) {
      const kwargs = msg?.kwargs || msg;
      const toolCallId = kwargs.tool_call_id;
      const content = kwargs.content;
      const name = kwargs.name || state.toolNames.get(toolCallId) || "";

      if (toolCallId && content !== undefined) {
        callbacks.onToolResult(toolCallId, name, String(content));
      }
    }
  }
}

// ── Tool call chunks (incremental args) ─────────────────────────────

function handleToolCallChunks(
  toolCallChunks: any[],
  callbacks: StreamCallbacks,
  state: ParserState
) {
  for (const tc of toolCallChunks) {
    const index = tc.index;

    if (tc.id) {
      state.indexToId.set(index, tc.id);
      if (tc.name) {
        state.indexToName.set(index, tc.name);
      }
    }

    const id = tc.id || state.indexToId.get(index);
    const name = tc.name || state.indexToName.get(index) || "";

    if (!id) continue;

    if (tc.args) {
      const current = state.partialArgsBuffer.get(id) || "";
      const newBuffer = current + tc.args;
      state.partialArgsBuffer.set(id, newBuffer);

      const extractedArgs = extractPartialArgs(newBuffer);
      const argsKey = JSON.stringify(extractedArgs);

      if (Object.keys(extractedArgs).length > 0 && state.lastEmittedArgs.get(id) !== argsKey) {
        state.lastEmittedArgs.set(id, argsKey);
        callbacks.onToolCall(id, name, extractedArgs, false);
      }
    }
  }
}

// ── Partial JSON extraction ─────────────────────────────────────────

/**
 * Estrae campi completati da un JSON parziale.
 * Funziona anche se il JSON non è completo.
 */
function extractPartialArgs(partialJson: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Campi stringa completati: "key": "value"
  const stringPattern = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  let match: RegExpExecArray | null;

  while ((match = stringPattern.exec(partialJson)) !== null) {
    const [, key, value] = match;
    const afterMatch = partialJson.slice(match.index + match[0].length);
    if (afterMatch.match(/^\s*[,}]/) || afterMatch.match(/^\s*$/)) {
      result[key] = value.replace(/\\"/g, '"').replace(/\\n/g, "\n");
    }
  }

  // Numeri e booleani
  const primitivePattern = /"([^"]+)":\s*(true|false|null|\d+(?:\.\d+)?)/g;
  while ((match = primitivePattern.exec(partialJson)) !== null) {
    const [, key, value] = match;
    if (value === "true") result[key] = true;
    else if (value === "false") result[key] = false;
    else if (value === "null") result[key] = null;
    else result[key] = parseFloat(value);
  }

  return result;
}
