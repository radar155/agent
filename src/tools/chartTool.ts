import { tool } from "langchain";
import { z } from "zod";

export interface ChartData {
  type: "chart";
  chartType: "bar" | "line" | "pie";
  title?: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
}

export const chartTool = tool(
  async ({ type, data, title }: { 
    type: "bar" | "line" | "pie"; 
    data: { labels: string[]; values: number[] }; 
    title?: string 
  }) => {
    if (data.labels.length !== data.values.length) {
      return JSON.stringify({
        success: false,
        error: `Labels (${data.labels.length}) and values (${data.values.length}) must have same length`,
      });
    }

    if (data.labels.length === 0) {
      return JSON.stringify({
        success: false,
        error: "Chart must have at least one data point",
      });
    }

    const chartOutput: ChartData = {
      type: "chart",
      chartType: type,
      title,
      data: {
        labels: data.labels,
        datasets: [{ label: title || "Data", data: data.values }],
      },
    };

    return JSON.stringify({ success: true, chart: chartOutput });
  },
  {
    name: "chart_display",
    description:
      "Create a chart visualization (bar, line, or pie). Provide labels and numeric values. The chart renders in the frontend.",
    schema: z.object({
      type: z.enum(["bar", "line", "pie"]).describe("Chart type: bar, line, or pie"),
      data: z.object({
        labels: z.array(z.string()).describe("Labels for data points"),
        values: z.array(z.number()).describe("Numeric values for each label"),
      }).describe("Chart data"),
      title: z.string().optional().describe("Optional chart title"),
    }),
  }
);
