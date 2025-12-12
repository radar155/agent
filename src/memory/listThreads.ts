import Database from "better-sqlite3";

export type CheckpointerType = "memory" | "postgres" | "sqlite";

export async function listThreads(): Promise<string[]> {
  const checkpointerType =
    (process.env.CHECKPOINTER_TYPE as CheckpointerType) ?? "memory";

  switch (checkpointerType) {
    case "sqlite":
      return listSqliteThreads();
    case "postgres":
      return listPostgresThreads();
    case "memory":
    default:
      // MemorySaver non supporta listing, ritorna array vuoto
      return [];
  }
}

function listSqliteThreads(): string[] {
  const dbPath = process.env.SQLITE_DB_PATH ?? "./data/checkpoints.db";

  try {
    const db = new Database(dbPath, { readonly: true });
    const rows = db
      .prepare("SELECT DISTINCT thread_id FROM checkpoints ORDER BY thread_id")
      .all() as { thread_id: string }[];
    db.close();
    return rows.map((r) => r.thread_id);
  } catch {
    return [];
  }
}

async function listPostgresThreads(): Promise<string[]> {
  // Per Postgres servirebbe pg client, per ora ritorna vuoto
  // Implementabile con: SELECT DISTINCT thread_id FROM checkpoints
  return [];
}
