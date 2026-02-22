import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

// Curated ElevenLabs voice IDs by archetype
const ELEVENLABS_VOICES = {
  // Male voices
  "hero_young": "pNInz6obpgDQGcFmaJgB",       // Adam - young energetic
  "villain_deep": "VR6AewLTigWG4xSOukaG",       // Arnold - deep villain
  "narrator_warm": "21m00Tcm4TlvDq8ikWAM",      // Rachel - warm narrator  
  "child_boy": "AZnzlk1XvdvUeBnXmlld",          // Domi - young/child
  "wise_elder": "D38z5RcWu1voky8WS1ja",          // Fin - wise elder
  "excited_young": "ErXwobaYiN019PkySvjV",       // Antoni - excited young male
  // Female voices
  "heroine_gentle": "MF3mGyEYCl7XYWbV9V6O",     // Elli - gentle female
  "child_girl": "jsCqWAovK2LkecY7zXl4",         // Freya - young female
  "villain_female": "oWAxZDx7w5VEj9dCyTzz",     // Grace - dramatic female
  "narrator_female": "ThT5KcBeYPX3keUQqHPh",    // Dorothy - clear narrator
  // Neutral/default
  "default": "21m00Tcm4TlvDq8ikWAM"
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voice_id, stability = 0.5, similarity_boost = 0.75, style = 0.0, speed = 1.0 } = await req.json();
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    const selectedVoiceId = voice_id || ELEVENLABS_VOICES.default;
    const cleanText = text.slice(0, 5000);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `ElevenLabs error: ${err}` }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const uploadRes = await base44.integrations.Core.UploadFile({ file: blob });

    return Response.json({ audio_url: uploadRes.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});