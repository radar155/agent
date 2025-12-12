import * as z from "zod";
import { tool } from "langchain";

export const getCurrentTime = tool(
  () => new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" }),
  {
    name: "get_current_time",
    description: "Get the current date and time",
    schema: z.object({}),
  }
);

export const getCurrentTemperature = tool(
  () => '10',
  {
    name: "get_current_temperature",
    description: "Get the current temperature",
    schema: z.object({}),
  }
);

export const getGreeting = tool(
  async ({ hour }) => {
    const h = parseInt(hour, 10);
    await new Promise(resolve => setTimeout(resolve, 10000));
    if (h >= 5 && h < 12) return "Buongiorno! ☀️";
    if (h >= 12 && h < 18) return "Buon pomeriggio! 🌤️";
    if (h >= 18 && h < 22) return "Buonasera! 🌆";
    return "Buonanotte! 🌙";
  },
  {
    name: "get_greeting",
    description: "Get an appropriate greeting based on the hour of the day. Use this after getting the current time to provide a contextual greeting.",
    schema: z.object({
      hour: z.string().describe("The current hour in 24h format (0-23)"),
    }),
  }
);

export const tools = [getCurrentTime, getGreeting, getCurrentTemperature];
