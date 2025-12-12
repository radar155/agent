import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

export const createPostgresCheckpointer = async () => {
  const dbUri = process.env.DATABASE_URL;
  
  if (!dbUri) {
    throw new Error("DATABASE_URL environment variable is required for Postgres checkpointer");
  }
  
  const checkpointer = PostgresSaver.fromConnString(dbUri);
  await checkpointer.setup();
  
  return checkpointer;
};
