import "dotenv/config";
import * as readline from "readline";
import * as fs from "fs";
import { bootstrap } from "./bootstrap.js";
import { agent } from "./agent";
import { parseAgentStream } from "./streamParser/index.js";

// Initialize sandbox (Docker container if needed) before anything else
await bootstrap();

const threadConfig = { configurable: { thread_id: "chat-1" } };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat(userInput: string) {
  const stream = await agent.stream(
    { messages: [{ role: "user", content: userInput }] },
    { ...threadConfig, streamMode: ["messages", "updates"] }
  );

  let isFirstToken = true;

  await parseAgentStream(stream as AsyncIterable<[string, unknown]>, {
    onToken: (content) => {
      if (isFirstToken) {
        process.stdout.write("Assistant: ");
        isFirstToken = false;
      }
      process.stdout.write(content);
    },
    onToolCall: (name, args) => {
      console.log(`[Tool Call] ${name}(${JSON.stringify(args)})`);
    },
    onToolResult: (content) => {
      console.log(`[Tool Result] ${content}`);
    },
    onDone: () => {
      if (!isFirstToken) console.log();
      console.log();
    },
    onError: (error) => {
      console.error(`Error: ${error.message}`);
    },
  });
}

async function dumpState() {
  const state = agent.getState(threadConfig);
  const stateFile = "state-dump.json";
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  console.log(`State saved to ${stateFile}`);
}

function prompt() {
  rl.question("You: ", async (input) => {
    const trimmed = input.trim();
    if (trimmed.toLowerCase() === "exit") {
      console.log("Bye!");
      rl.close();
      return;
    }
    if (trimmed.toLowerCase() === "/state") {
      await dumpState();
      prompt();
      return;
    }
    if (trimmed) {
      await chat(trimmed);
    }
    prompt();
  });
}

console.log('Chat started. Type "exit" to quit.\n');
prompt();
