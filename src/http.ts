import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";
import path from "path";
import { bootstrap } from "./bootstrap.js";
import { agent } from "./agent";
import { parseAgentStream } from "./streamParser/index.js";
import { listThreads } from "./memory/listThreads";
import { config } from "./services/config.js";

// Initialize sandbox (Docker container if needed) before anything else
await bootstrap();

const app = express();
const PORT = config.server.port;

app.use(cors());
app.use(express.json());

// Serve static files from outputs directory
app.use("/outputs", express.static(path.resolve(config.fileSystem.outputsPath)));

// SSE Event Types
type SSEEvent =
  | { type: "token"; content: string }
  | { type: "thinking"; content: string }
  | { type: "tool_call"; id: string; name: string; args: Record<string, unknown>; isComplete: boolean }
  | { type: "tool_result"; id: string; name: string; content: string }
  | { type: "thread_id"; threadId: string }
  | { type: "done" }
  | { type: "error"; message: string };

function sendSSE(res: Response, event: SSEEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function generateThreadId(): string {
  return crypto.randomUUID();
}

// POST /chat - Avvia una chat con streaming SSE
app.post("/chat", async (req: Request, res: Response) => {
  const { message, threadId } = req.body;
  const actualThreadId = threadId || generateThreadId();

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  // Setup SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Invia subito il threadId al client
  sendSSE(res, { type: "thread_id", threadId: actualThreadId });

  const threadConfig = { configurable: { thread_id: actualThreadId } };

  const stream = await agent.stream(
    { messages: [{ role: "user", content: message }] },
    { ...threadConfig, streamMode: ["messages", "updates"], recursionLimit: 100 }
  );

  await parseAgentStream(stream as AsyncIterable<[string, unknown]>, {
    onToken: (content) => sendSSE(res, { type: "token", content }),
    onThinking: (content) => sendSSE(res, { type: "thinking", content }),
    onToolCall: (id, name, args, isComplete) => sendSSE(res, { type: "tool_call", id, name, args, isComplete }),
    onToolResult: (id, name, content) => sendSSE(res, { type: "tool_result", id, name, content }),
    onDone: () => sendSSE(res, { type: "done" }),
    onError: (error) => sendSSE(res, { type: "error", message: error.message }),
  });

  res.end();
});

// GET /history/:threadId - Ottieni i messaggi della conversazione
app.get("/history/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const threadConfig = { configurable: { thread_id: threadId } };

  try {
    const state = (await agent.getState(threadConfig)) as any;
    res.json({
      threadId,
      messages: state?.values?.messages ?? [],
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

// GET /threads - Lista tutti i thread salvati
app.get("/threads", async (_req: Request, res: Response) => {
  try {
    const threads = await listThreads();
    res.json({ threads });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
  console.log(`  POST /chat           - Send message (SSE streaming)`);
  console.log(`  GET  /history/:id    - Get full conversation history`);
  console.log(`  GET  /threads        - List all saved threads`);
  console.log(`  GET  /outputs/*      - Download files`);
  console.log(`  GET  /health         - Health check`);
});
