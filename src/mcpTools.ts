import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const client = new MultiServerMCPClient({  
    suitableAreas: {
        transport: "http",
        url: "https://dev.energeea.com/mcp_suitableareasmanager/mcp",
    },
});

export const mcpTools = await client.getTools()