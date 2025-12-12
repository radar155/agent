import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";

export const createSqliteCheckpointer = async () => {
  const dbPath = process.env.SQLITE_DB_PATH ?? "./data/checkpoints.db";
  
  const checkpointer = SqliteSaver.fromConnString(dbPath);
  
  return checkpointer;
};
