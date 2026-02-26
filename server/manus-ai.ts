import OpenAI from "openai";
import { Buffer } from "node:buffer";

const manusClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function manusGenerateImage(
  prompt: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024",
  quality: "standard" | "hd" = "hd",
  style: "vivid" | "natural" = "vivid"
): Promise<{ url: string; b64: string }> {
  const response = await manusClient.images.generate({
    model: "dall-e-3",
    prompt,
    size,
    quality,
    style,
    response_format: "b64_json",
    n: 1,
  });

  const b64 = response.data[0]?.b64_json ?? "";
  const dataUrl = `data:image/png;base64,${b64}`;
  return { url: dataUrl, b64 };
}

export async function manusGenerateImageBuffer(
  prompt: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024"
): Promise<Buffer> {
  const { b64 } = await manusGenerateImage(prompt, size);
  return Buffer.from(b64, "base64");
}

export async function manusChat(
  prompt: string,
  systemPrompt?: string,
  model: string = "gpt-4o"
): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const completion = await manusClient.chat.completions.create({
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.8,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function manusBatchImages(
  prompts: { prompt: string; category: string }[],
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024"
): Promise<{ prompt: string; category: string; imageUrl: string }[]> {
  const results: { prompt: string; category: string; imageUrl: string }[] = [];

  for (const item of prompts) {
    try {
      const { url } = await manusGenerateImage(item.prompt, size, "hd", "vivid");
      results.push({ prompt: item.prompt, category: item.category, imageUrl: url });
    } catch (err: any) {
      console.error(`Manus image generation failed for: ${item.prompt}`, err.message);
    }
  }

  return results;
}

export { manusClient };
