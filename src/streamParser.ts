export type StreamCallbacks = {
  onToken: (content: string) => void;
  onToolCall: (id: string, name: string, args: unknown) => void;
  onToolResult: (id: string, name: string, content: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
};

export async function parseAgentStream(
  stream: AsyncIterable<[string, unknown]>,
  callbacks: StreamCallbacks
) {
  const toolNames = new Map<string, string>();
  try {
    for await (const [mode, chunk] of stream) {
      if (mode === "updates" && (chunk as any).model_request) {
        const msg = (chunk as any).model_request.messages?.[0];
        const toolCalls = msg?.tool_calls || msg?.kwargs?.tool_calls;
        if (toolCalls?.length) {
          for (const tc of toolCalls) {
            toolNames.set(tc.id, tc.name);
            callbacks.onToolCall(tc.id, tc.name, tc.args);
          }
        }
      } else if (mode === "updates" && (chunk as any).tools) {
        for (const toolMsg of (chunk as any).tools.messages || []) {
          const content = toolMsg?.content || toolMsg?.kwargs?.content;
          const toolCallId = toolMsg?.tool_call_id || toolMsg?.kwargs?.tool_call_id;
          if (content && toolCallId) {
            callbacks.onToolResult(toolCallId, toolNames.get(toolCallId) || "", String(content));
          }
        }
      } else if (mode === "messages") {
        const [messageChunk, metadata] = chunk as any;
        const content = messageChunk?.content || messageChunk?.kwargs?.content;
        if (metadata.langgraph_node === "model_request" && content) {
          callbacks.onToken(String(content));
        }
      }
    }
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}
