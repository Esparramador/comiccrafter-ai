import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, gender, personality } = await req.json();

    if (!name || !description) {
      return Response.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Generate sample audio using OpenAI TTS
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const voiceOptions = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = voiceOptions[Math.floor(Math.random() * voiceOptions.length)];

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: selectedVoice,
        input: 'Hola, esta es una voz generada por IA. Puedes usarme para tus proyectos.',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      return Response.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const { file_url } = await base44.integrations.Core.UploadFile({
      file: new Blob([audioBuffer], { type: 'audio/mpeg' })
    });

    // Create the voice profile
    const voiceProfile = await base44.entities.VoiceProfile.create({
      name,
      description,
      category: 'ai_generated',
      openai_voice: selectedVoice,
      gender: gender || 'neutral',
      personality: personality || 'neutral',
      sample_audio_url: file_url,
      avatar_emoji: ['👨‍🎤', '👩‍🎤', '🎙️', '🎵', '🎧'][Math.floor(Math.random() * 5)],
    });

    return Response.json(voiceProfile);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});