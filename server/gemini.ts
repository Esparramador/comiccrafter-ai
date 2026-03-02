import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const geminiBaseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

export const gemini = new GoogleGenAI({
  apiKey: geminiApiKey,
  ...(geminiBaseUrl ? { httpOptions: { apiVersion: "", baseUrl: geminiBaseUrl } } : {}),
});

export async function geminiChat(prompt: string, systemPrompt?: string): Promise<string> {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (systemPrompt) {
    contents.push({ role: "user", parts: [{ text: systemPrompt }] });
    contents.push({ role: "model", parts: [{ text: "Entendido. Procederé según las instrucciones." }] });
  }

  contents.push({ role: "user", parts: [{ text: prompt }] });

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: { maxOutputTokens: 4096 },
  });

  return response.text || "";
}
