export type StreamCallbacks = {
  onToken: (content: string) => void;
  onToolCall: (id: string, name: string, args: Record<string, unknown>, isComplete: boolean) => void;
  onToolResult: (id: string, name: string, content: string) => void;
  onThinking?: (content: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
};
