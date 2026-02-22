import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": ELEVENLABS_API_KEY }
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `ElevenLabs error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const voices = (data.voices || []).map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
      description: v.labels?.description || "",
      accent: v.labels?.accent || "",
      age: v.labels?.age || "",
      gender: v.labels?.gender || "",
      use_case: v.labels?.use_case || "",
      preview_url: v.preview_url
    }));

    return Response.json({ voices });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});