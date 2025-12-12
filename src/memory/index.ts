import { createInMemoryCheckpointer } from "./inMemory";
import { createPostgresCheckpointer } from "./postgres";
import { createSqliteCheckpointer } from "./sqlite";

export type CheckpointerType = "memory" | "postgres" | "sqlite";

export const createCheckpointer = async (type?: CheckpointerType) => {
  const checkpointerType =
    type ?? (process.env.CHECKPOINTER_TYPE as CheckpointerType) ?? "memory";

  switch (checkpointerType) {
    case "postgres":
      return await createPostgresCheckpointer();
    case "sqlite":
      return await createSqliteCheckpointer();
    case "memory":
    default:
      return createInMemoryCheckpointer();
  }
};

export { createInMemoryCheckpointer } from "./inMemory";
export { createPostgresCheckpointer } from "./postgres";
export { createSqliteCheckpointer } from "./sqlite";
