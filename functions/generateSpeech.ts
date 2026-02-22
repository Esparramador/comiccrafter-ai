import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice = "nova", speed = 1.0 } = await req.json();
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text.slice(0, 4096),
      speed: Math.min(Math.max(speed, 0.25), 4.0)
    });

    const buffer = await mp3.arrayBuffer();

    // Upload to base44 storage
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    formData.append('file', blob, 'speech.mp3');

    const uploadRes = await base44.integrations.Core.UploadFile({ file: blob });

    return Response.json({ audio_url: uploadRes.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});