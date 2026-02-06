import { tool } from "langchain";
import { z } from "zod";

export const webFetchTool = tool(
  async ({ url }: { url: string }): Promise<string> => {
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return JSON.stringify({
          success: false,
          error: "Invalid URL protocol. Only HTTP and HTTPS are supported.",
        });
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AgentBot/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        return JSON.stringify({
          success: false,
          error: `HTTP error: ${response.status} ${response.statusText}`,
        });
      }

      const contentType = response.headers.get("content-type") || "";
      let content = await response.text();

      // Estrai testo da HTML
      if (contentType.includes("text/html")) {
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        content = content.replace(/<[^>]+>/g, " ");
        content = content.replace(/&nbsp;/g, " ");
        content = content.replace(/&amp;/g, "&");
        content = content.replace(/&lt;/g, "<");
        content = content.replace(/&gt;/g, ">");
        content = content.replace(/&quot;/g, '"');
        content = content.replace(/&#39;/g, "'");
        content = content.replace(/\s+/g, " ").trim();
      }

      // Tronca se troppo lungo (max 50KB)
      if (content.length > 50000) {
        content = content.substring(0, 50000) + "\n\n[Content truncated...]";
      }

      return JSON.stringify({ success: true, url, contentType, content });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  {
    name: "web_fetch",
    description: "Fetch and extract text content from a URL. Use this to read web pages.",
    schema: z.object({
      url: z.string().url().describe("The URL to fetch content from"),
    }),
  }
);
