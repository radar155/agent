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

// Mappa di colori professionali (toni muted, non accesi)
const professionalColors: Record<string, string> = {
  // Blu
  blu: "#4A6FA5",
  blue: "#4A6FA5",
  azzurro: "#6B9AC4",
  celeste: "#89B0D3",
  navy: "#2C3E50",
  // Verdi
  verde: "#5D8A66",
  green: "#5D8A66",
  oliva: "#6B7B3C",
  salvia: "#9CAF88",
  menta: "#8FBC8F",
  smeraldo: "#4A7C6F",
  // Rossi/Rosa
  rosso: "#A45A52",
  red: "#A45A52",
  bordeaux: "#722F37",
  rosa: "#C9A9A6",
  pink: "#C9A9A6",
  corallo: "#CD8B76",
  terracotta: "#B56B4F",
  // Gialli/Arancioni
  giallo: "#D4B896",
  yellow: "#D4B896",
  oro: "#B8A361",
  arancione: "#CC8B5E",
  orange: "#CC8B5E",
  pesca: "#E8C4A8",
  ambra: "#C9A227",
  // Viola/Porpora
  viola: "#7B6B8D",
  purple: "#7B6B8D",
  lavanda: "#9D8CA1",
  malva: "#8E7B8B",
  prugna: "#5D4157",
  // Marroni/Beige
  marrone: "#6B5344",
  brown: "#6B5344",
  beige: "#C9B99A",
  crema: "#E8DCC4",
  sabbia: "#C2B280",
  cioccolato: "#5C4033",
  caramello: "#A67B5B",
  // Grigi
  grigio: "#6B7280",
  gray: "#6B7280",
  grey: "#6B7280",
  antracite: "#3D4449",
  argento: "#A8A9AD",
  ardesia: "#708090",
  // Neutri
  bianco: "#F5F5F5",
  white: "#F5F5F5",
  nero: "#2D2D2D",
  black: "#2D2D2D",
  avorio: "#FFFFF0",
  // Toni naturali
  oceano: "#4A7C8C",
  foresta: "#4A5D4A",
  cielo: "#87CEEB",
  tramonto: "#C9896D",
  alba: "#E8C4A8",
  notte: "#2C3E50",
};

export const changeBackground = tool(
  ({ color }) => {
    const normalizedColor = color.toLowerCase().trim();
    
    // Cerca corrispondenza esatta
    if (professionalColors[normalizedColor]) {
      return professionalColors[normalizedColor];
    }
    
    // Cerca corrispondenza parziale
    for (const [key, hex] of Object.entries(professionalColors)) {
      if (normalizedColor.includes(key) || key.includes(normalizedColor)) {
        return hex;
      }
    }
    
    // Default: grigio professionale neutro
    return "#6B7280";
  },
  {
    name: "change_background",
    description: "Converts a natural language color description to a professional CSS hexadecimal color. Returns muted, professional tones suitable for UI backgrounds.",
    schema: z.object({
      color: z.string().describe("The color name in natural language (e.g., 'blu', 'verde scuro', 'beige')"),
    }),
  }
);

export const tools = [getCurrentTime, getGreeting, changeBackground];
