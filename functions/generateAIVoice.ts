import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      gender,
      age_range,
      nationality,
      personality,
      text,
      speed = 1.0
    } = await req.json();

    if (!name || !text) {
      return Response.json(
        { error: 'Name and text are required' },
        { status: 400 }
      );
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      return Response.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Map personality to voice ID from ElevenLabs
    const voiceMap = {
      hero: 'pNInz6obpgDQGcFmaJgB',       // Adam
      villain: 'EXAVITQu4vr4xnSDxMaL',    // Bella
      comedic: 'MF3mGyEYCl7XYWbV9V2O',   // Elli
      romantic: 'TxGEqnHWrfWFTfGW9XjX',   // Grace
      wise: 'onwK4e9ZDvkoqWQcIYvL',      // Harry
      child: '5Q0jbAFD82YeDArVfZaG',     // Liam
      neutral: '21m00Tcm4TlvDq8ikWAM'     // Rachel
    };

    const voiceId = voiceMap[personality?.toLowerCase()] || voiceMap.neutral;

    // Call ElevenLabs API for text-to-speech
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.substring(0, 500), // Limit to 500 characters
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      console.error('ElevenLabs error:', error);
      return Response.json(
        { error: 'Failed to generate voice' },
        { status: 500 }
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    
    // Upload to Base44 storage
    const { file_url } = await base44.integrations.Core.UploadFile({
      file: new Blob([audioBuffer], { type: 'audio/mpeg' })
    });

    // Create VoiceProfile record
    const voiceProfile = await base44.entities.VoiceProfile.create({
      name,
      description: `${personality || 'Neutral'} voice - ${nationality || 'English'} accent`,
      category: 'ai_generated',
      openai_voice: 'nova',
      gender: gender || 'neutral',
      age_range: age_range || 'adult',
      nationality: nationality || 'English',
      personality: personality || 'neutral',
      sample_audio_url: file_url,
      sample_text: text,
      avatar_emoji: {
        male: '👨‍🎤',
        female: '👩‍🎤',
        neutral: '🎙️'
      }[gender] || '🎤',
      speed: speed
    });

    return Response.json({
      voiceProfile,
      audio_url: file_url
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});