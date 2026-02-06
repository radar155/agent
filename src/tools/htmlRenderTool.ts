import { tool } from "langchain";
import { z } from "zod";

export const htmlRenderTool = tool(
  async ({ html, title }: { html: string; title?: string }) => {
    return JSON.stringify({ 
      type: "html", 
      html, 
      title: title || "Output" 
    });
  },
  {
    name: "render_html",
    description: "Render arbitrary HTML/CSS/JS in a sandboxed iframe. Use for interactive visualizations, tables, forms, mini-apps, custom UI components, or any visual content that benefits from full HTML control. The HTML should be a complete document or self-contained fragment.",
    schema: z.object({
      html: z.string().describe("Complete HTML document or fragment to render. Can include inline CSS and JavaScript."),
      title: z.string().optional().describe("Optional title shown above the rendered content"),
    }),
  }
);
