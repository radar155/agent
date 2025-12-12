import { MemorySaver } from "@langchain/langgraph";

export const createInMemoryCheckpointer = () => {
  return new MemorySaver();
};
