const ELEVEN_API_BASE = "https://api.elevenlabs.io/v1";

function getHeaders(contentType = "application/json") {
  const headers: Record<string, string> = {
    "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

export interface ElevenVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

export async function listVoices(): Promise<ElevenVoice[]> {
  const res = await fetch(`${ELEVEN_API_BASE}/voices`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs voices error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.voices || [];
}

export async function textToSpeech(
  voiceId: string,
  text: string,
  options?: {
    model_id?: string;
    stability?: number;
    similarity_boost?: number;
  }
): Promise<Buffer> {
  const res = await fetch(`${ELEVEN_API_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      text,
      model_id: options?.model_id || "eleven_multilingual_v2",
      voice_settings: {
        stability: options?.stability ?? 0.5,
        similarity_boost: options?.similarity_boost ?? 0.75,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs TTS error: ${res.status} ${err}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getVoiceById(voiceId: string) {
  const res = await fetch(`${ELEVEN_API_BASE}/voices/${voiceId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs voice error: ${res.status} ${err}`);
  }
  return res.json();
}
