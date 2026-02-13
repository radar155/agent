import "dotenv/config";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import { bootstrap } from "./bootstrap.js";
import { agent } from "./agent";
import { parseAgentStream } from "./streamParser/index.js";
import { config } from "./services/config.js";

// ── ANSI colors ─────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  // foreground
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  // bright
  brightYellow: "\x1b[93m",
  brightCyan: "\x1b[96m",
  brightGreen: "\x1b[92m",
};

// ── Helpers ──────────────────────────────────────────────────────────

const SEPARATOR = `${c.gray}${"─".repeat(60)}${c.reset}`;

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.substring(0, max) + "…";
}

/** Save HTML string to outputs dir and open in browser */
function saveAndOpenHtml(html: string, title?: string): string {
  const outputsDir = path.resolve(config.fileSystem.outputsPath);
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

  const slug = (title || "output").replace(/[^a-zA-Z0-9]+/g, "_").substring(0, 40);
  const filename = `${slug}_${Date.now()}.html`;
  const filePath = path.join(outputsDir, filename);

  fs.writeFileSync(filePath, html, "utf-8");

  // Open in default browser
  const absPath = path.resolve(filePath);
  const platform = process.platform;
  const cmd = platform === "win32" ? `start "" "${absPath}"`
    : platform === "darwin" ? `open "${absPath}"`
    : `xdg-open "${absPath}"`;
  exec(cmd, () => {}); // fire and forget

  return filePath;
}

/** Build a standalone HTML page for a Chart.js chart */
function buildChartHtml(chartData: any): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${chartData.title || "Chart"}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>body{margin:20px;background:#1a1a2e;display:flex;justify-content:center;}canvas{max-width:800px;max-height:500px;}</style>
</head><body>
<canvas id="c"></canvas>
<script>
new Chart(document.getElementById('c'),{
  type:'${chartData.chartType}',
  data:${JSON.stringify(chartData.data)},
  options:{responsive:true,plugins:{legend:{labels:{color:'#eee'}},title:{display:${!!chartData.title},text:'${(chartData.title || "").replace(/'/g, "\\'")}',color:'#eee'}},scales:${chartData.chartType !== "pie" ? '{"x":{"ticks":{"color":"#aaa"},"grid":{"color":"#333"}},"y":{"ticks":{"color":"#aaa"},"grid":{"color":"#333"}}}' : "undefined"}}
});
</script></body></html>`;
}

/** Format a tool result — compact summary */
function formatToolResult(name: string, content: string): string {
  let parsed: any;
  try { parsed = JSON.parse(content); } catch { parsed = null; }

  if (!parsed) {
    return `  ${c.gray}↳ ${truncate(content, 80)}${c.reset}`;
  }

  const ok = parsed.success !== false;
  const icon = ok ? `${c.brightGreen}✔` : `${c.red}✘`;

  switch (name) {
    case "bash": {
      const lines: string[] = [];
      lines.push(`  ${icon} ${c.gray}exit ${parsed.exitCode ?? "?"}${c.reset}`);
      if (parsed.stdout?.trim()) {
        const out = truncate(parsed.stdout.trim(), 200);
        lines.push(`  ${c.dim}${out}${c.reset}`);
      }
      if (parsed.stderr?.trim() && parsed.exitCode !== 0) {
        lines.push(`  ${c.red}${truncate(parsed.stderr.trim(), 150)}${c.reset}`);
      }
      return lines.join("\n");
    }
    case "create_file":
    case "str_replace": {
      const msg = parsed.message || (ok ? "ok" : parsed.error || "errore");
      return `  ${icon} ${c.gray}${msg}${c.reset}`;
    }
    case "view": {
      if (parsed.type === "directory") {
        return `  ${icon} ${c.gray}(directory listing)${c.reset}`;
      }
      const preview = parsed.content ? truncate(parsed.content, 120) : "";
      return `  ${icon} ${c.gray}${preview || "(vuoto)"}${c.reset}`;
    }
    case "web_fetch": {
      if (ok) {
        const preview = parsed.content ? truncate(parsed.content, 120) : "";
        return `  ${icon} ${c.gray}${preview}${c.reset}`;
      }
      return `  ${icon} ${c.red}${parsed.error}${c.reset}`;
    }
    case "present_files": {
      if (ok && Array.isArray(parsed.files)) {
        const names = parsed.files.map((f: any) => f.filename).join(", ");
        return `  ${icon} ${c.gray}${names}${c.reset}`;
      }
      return `  ${icon} ${c.gray}${parsed.error || "ok"}${c.reset}`;
    }
    case "chart_display": {
      try {
        const chartParsed = JSON.parse(content);
        if (chartParsed.success && chartParsed.chart) {
          const html = buildChartHtml(chartParsed.chart);
          const filePath = saveAndOpenHtml(html, chartParsed.chart.title);
          return `  ${c.brightGreen}✔${c.reset} ${c.gray}Grafico aperto nel browser → ${c.cyan}${filePath}${c.reset}`;
        }
      } catch {}
      return `  ${icon} ${c.gray}(grafico generato)${c.reset}`;
    }
    case "render_html": {
      try {
        const htmlParsed = JSON.parse(content);
        if (htmlParsed.type === "html" && htmlParsed.html) {
          const filePath = saveAndOpenHtml(htmlParsed.html, htmlParsed.title);
          return `  ${c.brightGreen}✔${c.reset} ${c.gray}HTML aperto nel browser → ${c.cyan}${filePath}${c.reset}`;
        }
      } catch {}
      return `  ${icon} ${c.gray}(HTML renderizzato)${c.reset}`;
    }
    default: {
      const summary = ok ? "ok" : (parsed.error || "errore");
      return `  ${icon} ${c.gray}${truncate(summary, 80)}${c.reset}`;
    }
  }
}

// ── Bootstrap ────────────────────────────────────────────────────────

await bootstrap();

let threadId = crypto.randomUUID();
const threadConfig = () => ({ configurable: { thread_id: threadId } });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ── Chat loop ────────────────────────────────────────────────────────

async function chat(userInput: string) {
  const stream = await agent.stream(
    { messages: [{ role: "user", content: userInput }] },
    { ...threadConfig(), streamMode: ["messages", "updates"], recursionLimit: 100 }
  );

  let isInText = false;
  let hasOutput = false;

  // Incremental tool call state: track what we already printed per tool id
  const toolState = new Map<string, { headerPrinted: boolean; printedKeys: Set<string> }>();

  const ensureToolHeader = (id: string, name: string) => {
    let state = toolState.get(id);
    if (!state) {
      state = { headerPrinted: false, printedKeys: new Set() };
      toolState.set(id, state);
    }
    if (!state.headerPrinted) {
      // Close text block if open
      if (isInText) {
        process.stdout.write(`${c.reset}\n`);
        isInText = false;
      }
      if (hasOutput) process.stdout.write("\n");
      process.stdout.write(`  ${c.yellow}⚡ ${name}${c.reset}\n`);
      state.headerPrinted = true;
      hasOutput = true;
    }
    return state;
  };

  /** Print new arg details incrementally as they arrive */
  const printToolArgs = (id: string, name: string, args: Record<string, unknown>) => {
    const state = ensureToolHeader(id, name);

    // Per-tool logic: print each relevant key once
    const tryPrint = (key: string, line: string) => {
      if (args[key] !== undefined && !state.printedKeys.has(key)) {
        state.printedKeys.add(key);
        process.stdout.write(line + "\n");
      }
    };

    switch (name) {
      case "create_file":
        tryPrint("path", `     ${c.cyan}📄 ${args.path}${c.reset}`);
        tryPrint("description", `     ${c.gray}${c.italic}${args.description}${c.reset}`);
        break;
      case "str_replace":
        tryPrint("path", `     ${c.cyan}📄 ${args.path}${c.reset}`);
        tryPrint("old_str", `     ${c.red}- ${truncate(String(args.old_str), 60)}${c.reset}`);
        tryPrint("new_str", `     ${c.green}+ ${truncate(String(args.new_str), 60)}${c.reset}`);
        break;
      case "bash":
        tryPrint("command", `     ${c.gray}$ ${args.command}${c.reset}`);
        break;
      case "view":
        tryPrint("path", `     ${c.cyan}📄 ${args.path}${c.reset}`);
        break;
      case "web_fetch":
        tryPrint("url", `     ${c.blue}🌐 ${args.url}${c.reset}`);
        break;
      case "present_files":
        if (Array.isArray(args.paths) && !state.printedKeys.has("paths")) {
          state.printedKeys.add("paths");
          for (const p of args.paths) process.stdout.write(`     ${c.cyan}📎 ${p}${c.reset}\n`);
        }
        break;
      case "chart_display":
        tryPrint("title", `     ${c.magenta}📊 ${args.title}${c.reset}`);
        tryPrint("type", `     ${c.gray}tipo: ${args.type}${c.reset}`);
        break;
      case "render_html":
        tryPrint("title", `     ${c.magenta}🖼  ${args.title}${c.reset}`);
        break;
      default: {
        // Generic: print each key once
        for (const k of Object.keys(args)) {
          if (!state.printedKeys.has(k)) {
            state.printedKeys.add(k);
            const v = args[k];
            const display = typeof v === "string" ? truncate(v, 40) : JSON.stringify(v);
            process.stdout.write(`     ${c.gray}${k}: ${display}${c.reset}\n`);
          }
        }
      }
    }
  };

  await parseAgentStream(stream as AsyncIterable<[string, unknown]>, {
    onToken: (content) => {
      if (!isInText) {
        if (hasOutput) process.stdout.write("\n");
        process.stdout.write(`${c.white}`);
        isInText = true;
      }
      process.stdout.write(content);
      hasOutput = true;
    },

    onToolCall: (_id, name, args, isComplete) => {
      // Print incrementally — both partial and complete calls
      printToolArgs(_id, name, args);

      // If complete, show a subtle "generating..." → will be replaced by result
      if (isComplete && !toolState.get(_id)?.printedKeys.has("_complete")) {
        toolState.get(_id)!.printedKeys.add("_complete");
        process.stdout.write(`     ${c.gray}${c.italic}⏳ esecuzione…${c.reset}\n`);
      }
    },

    onToolResult: (_id, name, content) => {
      if (isInText) {
        process.stdout.write(`${c.reset}\n`);
        isInText = false;
      }
      process.stdout.write(formatToolResult(name, content) + "\n");
      hasOutput = true;
    },

    onThinking: (content) => {
      if (isInText) {
        process.stdout.write(`${c.reset}\n`);
        isInText = false;
      }
      process.stdout.write(`${c.dim}${c.italic}${content}${c.reset}`);
      hasOutput = true;
    },

    onDone: () => {
      if (isInText) process.stdout.write(`${c.reset}`);
      process.stdout.write("\n");
    },

    onError: (error) => {
      if (isInText) process.stdout.write(`${c.reset}\n`);
      console.error(`\n${c.red}❌ ${error.message}${c.reset}\n`);
    },
  });
}

// ── Commands ─────────────────────────────────────────────────────────

async function dumpState() {
  const state = agent.getState(threadConfig());
  const stateFile = "state-dump.json";
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  console.log(`${c.gray}State saved to ${stateFile}${c.reset}`);
}

function newThread() {
  threadId = crypto.randomUUID();
  console.log(`${c.gray}Nuova conversazione: ${threadId}${c.reset}`);
}

function showHelp() {
  console.log(`
${c.bold}Comandi:${c.reset}
  ${c.cyan}/new${c.reset}     Nuova conversazione
  ${c.cyan}/state${c.reset}   Dump stato conversazione
  ${c.cyan}/help${c.reset}    Mostra questo messaggio
  ${c.cyan}exit${c.reset}     Esci
`);
}

// ── Prompt loop ──────────────────────────────────────────────────────

function prompt() {
  rl.question(`\n${c.brightCyan}You: ${c.reset}`, async (input) => {
    const trimmed = input.trim();

    if (!trimmed) { prompt(); return; }
    if (trimmed.toLowerCase() === "exit") {
      console.log(`${c.gray}Bye!${c.reset}`);
      rl.close();
      return;
    }
    if (trimmed === "/state") { await dumpState(); prompt(); return; }
    if (trimmed === "/new") { newThread(); prompt(); return; }
    if (trimmed === "/help") { showHelp(); prompt(); return; }

    console.log(SEPARATOR);
    await chat(trimmed);
    console.log(SEPARATOR);

    prompt();
  });
}

console.log(`\n${c.bold}TermAgent CLI${c.reset} ${c.gray}— thread: ${threadId}${c.reset}`);
console.log(`${c.gray}Digita /help per i comandi${c.reset}\n`);
prompt();
