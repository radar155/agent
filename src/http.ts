import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { agent } from "./agent";
import { parseAgentStream } from "./streamParser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// SSE Event Types
type SSEEvent =
  | { type: "token"; content: string }
  | { type: "tool_call"; name: string; args: unknown }
  | { type: "tool_result"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

function sendSSE(res: Response, event: SSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

// POST /chat - Avvia una chat con streaming SSE
app.post("/chat", async (req: Request, res: Response) => {
  const { message, threadId = "chat-1" } = req.body;

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  // Setup SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const threadConfig = { configurable: { thread_id: threadId } };

  const stream = await agent.stream(
    { messages: [{ role: "user", content: message }] },
    { ...threadConfig, streamMode: ["messages", "updates"] }
  );

  await parseAgentStream(stream as AsyncIterable<[string, unknown]>, {
    onToken: (content) => sendSSE(res, { type: "token", content }),
    onToolCall: (name, args) => sendSSE(res, { type: "tool_call", name, args }),
    onToolResult: (content) => sendSSE(res, { type: "tool_result", content }),
    onDone: () => sendSSE(res, { type: "done" }),
    onError: (error) => sendSSE(res, { type: "error", message: error.message }),
  });

  res.end();
});

// GET /state/:threadId - Ottieni lo stato della conversazione
app.get("/state/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const threadConfig = { configurable: { thread_id: threadId } };

  try {
    const state = agent.getState(threadConfig);
    res.json(state);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /chat         - Send message (SSE streaming)`);
  console.log(`  GET  /state/:id    - Get conversation state`);
  console.log(`  GET  /health       - Health check`);
});
