export type StreamCallbacks = {
  onToken: (content: string) => void;
  onToolCall: (name: string, args: unknown) => void;
  onToolResult: (content: string, toolName: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
};

export async function parseAgentStream(
  stream: AsyncIterable<[string, unknown]>,
  callbacks: StreamCallbacks
) {
  let lastToolName = "";

  try {
    for await (const [mode, chunk] of stream) {
      if (mode === "updates" && (chunk as any).model_request) {
        const msg = (chunk as any).model_request.messages?.[0];
        const toolCalls = msg?.tool_calls || msg?.kwargs?.tool_calls;
        if (toolCalls?.length) {
          for (const tc of toolCalls) {
            lastToolName = tc.name;
            callbacks.onToolCall(tc.name, tc.args);
          }
        }
      } else if (mode === "updates" && (chunk as any).tools) {
        const toolMsg = (chunk as any).tools.messages?.[0];
        const content = toolMsg?.content || toolMsg?.kwargs?.content;
        const toolName = toolMsg?.name || toolMsg?.kwargs?.name || lastToolName;
        if (content) {
          callbacks.onToolResult(String(content), toolName);
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
