import type { StreamCallbacks } from "./types.js";

/**
 * Parser per stream di agenti LangChain con modelli Anthropic.
 * Supporta streaming incrementale degli args dei tool calls.
 */
export async function parseAnthropicStream(
  stream: AsyncIterable<[string, unknown]>,
  callbacks: StreamCallbacks
) {
  const toolNames = new Map<string, string>();
  const partialArgsBuffer = new Map<string, string>();
  const lastEmittedArgs = new Map<string, string>();
  const indexToId = new Map<number, string>();
  const indexToName = new Map<number, string>();

  try {
    for await (const [mode, chunk] of stream) {
      if (mode === "messages") {
        parseMessagesChunk(chunk, callbacks, partialArgsBuffer, lastEmittedArgs, indexToId, indexToName);
      } else if (mode === "updates") {
        parseUpdatesChunk(chunk, callbacks, toolNames, partialArgsBuffer, lastEmittedArgs);
      }
    }
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Tenta di estrarre campi completati da un JSON parziale.
 * Funziona anche se il JSON non è completo.
 */
function extractPartialArgs(partialJson: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Pattern per estrarre campi stringa completati: "key": "value"
  // Deve avere la virgoletta di chiusura del valore
  const stringPattern = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  let match: RegExpExecArray | null;
  
  while ((match = stringPattern.exec(partialJson)) !== null) {
    const [, key, value] = match;
    // Verifica che il campo sia "chiuso" (seguito da , o } o fine stringa valida)
    const afterMatch = partialJson.slice(match.index + match[0].length);
    if (afterMatch.match(/^\s*[,}]/) || afterMatch.match(/^\s*$/)) {
      result[key] = value.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
  }
  
  // Pattern per numeri e booleani
  const primitivePattern = /"([^"]+)":\s*(true|false|null|\d+(?:\.\d+)?)/g;
  while ((match = primitivePattern.exec(partialJson)) !== null) {
    const [, key, value] = match;
    if (value === 'true') result[key] = true;
    else if (value === 'false') result[key] = false;
    else if (value === 'null') result[key] = null;
    else result[key] = parseFloat(value);
  }
  
  return result;
}

function parseMessagesChunk(
  chunk: unknown,
  callbacks: StreamCallbacks,
  partialArgsBuffer: Map<string, string>,
  lastEmittedArgs: Map<string, string>,
  indexToId: Map<number, string>,
  indexToName: Map<number, string>
) {
  const [messageChunk, metadata] = chunk as [any, any];
  
  const nodeType = metadata?.langgraph_node;
  if (nodeType !== "model" && nodeType !== "model_request") {
    return;
  }

  const kwargs = messageChunk?.kwargs || messageChunk;
  
  // Accumula tool_call_chunks per streaming incrementale degli args
  const toolCallChunks = kwargs?.tool_call_chunks;
  if (Array.isArray(toolCallChunks) && toolCallChunks.length > 0) {
    for (const tc of toolCallChunks) {
      const index = tc.index;
      
      // Se ha id, salva l'associazione index → id
      if (tc.id) {
        indexToId.set(index, tc.id);
        if (tc.name) {
          indexToName.set(index, tc.name);
        }
      }
      
      // Recupera id dall'index
      const id = tc.id || indexToId.get(index);
      const name = tc.name || indexToName.get(index) || '';
      
      if (!id) {
        continue;
      }
      
      // Accumula gli args
      if (tc.args) {
        const current = partialArgsBuffer.get(id) || '';
        const newBuffer = current + tc.args;
        partialArgsBuffer.set(id, newBuffer);
        
        // Prova a estrarre args parziali
        const extractedArgs = extractPartialArgs(newBuffer);
        
        // Emetti solo se abbiamo nuovi campi
        const argsKey = JSON.stringify(extractedArgs);
        if (Object.keys(extractedArgs).length > 0 && lastEmittedArgs.get(id) !== argsKey) {
          lastEmittedArgs.set(id, argsKey);
          callbacks.onToolCall(id, name, extractedArgs, false);
        }
      }
    }
  }

  // Gestisci content testuale
  const content = kwargs?.content;
  if (typeof content === "string" && content) {
    callbacks.onToken(content);
    return;
  }

  // contentBlocks
  const contentBlocks = messageChunk?.contentBlocks;
  if (Array.isArray(contentBlocks)) {
    for (const block of contentBlocks) {
      if (block.type === "thinking" && block.thinking) {
        callbacks.onThinking?.(block.thinking);
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
      } else if (item?.type === "thinking" && item.thinking) {
        callbacks.onThinking?.(item.thinking);
      }
    }
  }
}

function parseUpdatesChunk(
  chunk: unknown,
  callbacks: StreamCallbacks,
  toolNames: Map<string, string>,
  partialArgsBuffer: Map<string, string>,
  lastEmittedArgs: Map<string, string>
) {
  const data = chunk as Record<string, any>;
  
  const modelData = data.model || data.model_request;
  if (modelData) {
    const messages = modelData.messages;
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        const kwargs = msg?.kwargs || msg;
        
        // Extended thinking
        if (Array.isArray(kwargs.content)) {
          for (const block of kwargs.content) {
            if (block?.type === "thinking" && block.thinking) {
              callbacks.onThinking?.(block.thinking);
            }
          }
        }

        // Tool calls completi
        const toolCalls = kwargs.tool_calls;
        if (Array.isArray(toolCalls) && toolCalls.length > 0) {
          for (const tc of toolCalls) {
            if (tc.id && tc.name) {
              toolNames.set(tc.id, tc.name);
              callbacks.onToolCall(tc.id, tc.name, tc.args || {}, true);
              partialArgsBuffer.delete(tc.id);
              lastEmittedArgs.delete(tc.id);
            }
          }
        }
      }
    }
  }

  // Tool results
  if (data.tools) {
    const messages = data.tools.messages;
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        const kwargs = msg?.kwargs || msg;
        const toolCallId = kwargs.tool_call_id;
        const content = kwargs.content;
        const name = kwargs.name || toolNames.get(toolCallId) || "";

        if (toolCallId && content !== undefined) {
          callbacks.onToolResult(toolCallId, name, String(content));
        }
      }
    }
  }
}
