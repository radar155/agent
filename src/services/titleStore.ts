import Database from "better-sqlite3";
import type { CheckpointerType } from "../memory/index.js";

export interface TitleStore {
  get(threadId: string): Promise<string | null>;
  set(threadId: string, title: string): Promise<void>;
  getAll(): Promise<Map<string, string>>;
}

// === In-Memory ===
class MemoryTitleStore implements TitleStore {
  private titles = new Map<string, string>();
  async get(threadId: string) { return this.titles.get(threadId) ?? null; }
  async set(threadId: string, title: string) { this.titles.set(threadId, title); }
  async getAll() { return new Map(this.titles); }
}

// === SQLite ===
class SqliteTitleStore implements TitleStore {
  private dbPath: string;
  constructor(dbPath: string) {
    this.dbPath = dbPath;
    const db = new Database(dbPath);
    db.exec(`CREATE TABLE IF NOT EXISTS thread_titles (
      thread_id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    )`);
    db.close();
  }
  async get(threadId: string) {
    const db = new Database(this.dbPath, { readonly: true });
    const row = db.prepare("SELECT title FROM thread_titles WHERE thread_id = ?").get(threadId) as { title: string } | undefined;
    db.close();
    return row?.title ?? null;
  }
  async set(threadId: string, title: string) {
    const db = new Database(this.dbPath);
    db.prepare("INSERT OR REPLACE INTO thread_titles (thread_id, title) VALUES (?, ?)").run(threadId, title);
    db.close();
  }
  async getAll() {
    const db = new Database(this.dbPath, { readonly: true });
    const rows = db.prepare("SELECT thread_id, title FROM thread_titles").all() as { thread_id: string; title: string }[];
    db.close();
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.thread_id, r.title);
    return map;
  }
}

// === Postgres ===
class PostgresTitleStore implements TitleStore {
  private memory = new MemoryTitleStore();
  async get(threadId: string) { return this.memory.get(threadId); }
  async set(threadId: string, title: string) { return this.memory.set(threadId, title); }
  async getAll() { return this.memory.getAll(); }
}

export function createTitleStore(): TitleStore {
  const type = (process.env.CHECKPOINTER_TYPE as CheckpointerType) ?? "memory";
  switch (type) {
    case "sqlite": {
      const dbPath = process.env.SQLITE_DB_PATH ?? "./data/checkpoints.db";
      return new SqliteTitleStore(dbPath);
    }
    case "postgres":
      return new PostgresTitleStore();
    case "memory":
    default:
      return new MemoryTitleStore();
  }
}
