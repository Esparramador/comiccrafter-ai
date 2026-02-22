import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, story, duration, quality, targetAge = "3-6", language = "es", characters = [] } = body;

    if (!title || !story || !duration || !quality) {
      return Response.json(
        { error: 'Missing required fields: title, story, duration, quality' },
        { status: 400 }
      );
    }

    // Calculate parameters based on duration and quality
    const qualityConfig = {
      rapido: { sceneCount: Math.ceil(duration * 1.5), complexity: "simple", promptDetail: "concise" },
      estandar: { sceneCount: Math.ceil(duration * 2), complexity: "moderate", promptDetail: "detailed" },
      premium: { sceneCount: Math.ceil(duration * 2.5), complexity: "rich", promptDetail: "very detailed" },
      cinematico: { sceneCount: Math.ceil(duration * 3), complexity: "cinematic", promptDetail: "extremely detailed" }
    };

    const config = qualityConfig[quality] || qualityConfig.estandar;
    const sceneCount = Math.min(Math.max(config.sceneCount, 4), 200);

    // Map target age to storytelling style
    const ageGuide = {
      "0-3": "Very simple, short sentences, repetition, bright colors, gentle action",
      "3-6": "Simple vocabulary, magic and imagination, friendly characters, clear morals",
      "6-10": "Adventure, friendship, problem-solving, humor, light drama",
      "10-14": "Deeper emotions, personal growth, some conflict and challenge",
      "all_ages": "Universal themes, multiple levels of meaning, humor for adults and children"
    };

    // Generate comprehensive script using LLM
    const scriptPrompt = `You are a master screenwriter for ${quality === 'cinematico' ? 'cinematic' : 'animated'} children's content.

PROJECT: ${title}
STORY: ${story}
TARGET AGE: ${targetAge} (${ageGuide[targetAge]})
DURATION: ~${duration} minutes across ${sceneCount} scenes
QUALITY LEVEL: ${quality} (complexity: ${config.complexity})
LANGUAGE: ${language}

Create a complete screenplay with EXACTLY ${sceneCount} scenes. Each scene must include:
- Vivid visual description (${config.promptDetail} prompts for AI image generation)
- Character dialogue and narrator text in ${language}
- Camera angles and transitions
- Emotional beats and pacing
- Sound design elements

Ensure:
1. Story arc is complete with clear beginning, middle, end
2. Dialogue is age-appropriate for ${targetAge} year olds
3. Scenes flow naturally with consistent pacing
4. Each scene takes roughly ${Math.round(duration * 60 / sceneCount)} seconds`;

    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: scriptPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          synopsis: { type: "string" },
          moral_lesson: { type: "string" },
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scene_number: { type: "number" },
                scene_description: { type: "string" },
                visual_prompt: { type: "string" },
                camera_angle: { type: "string" },
                dialogue: { type: "string" },
                narrator_text: { type: "string" },
                sound_effect: { type: "string" },
                transition: { type: "string" },
                emotional_beat: { type: "string" }
              }
            }
          }
        }
      }
    });

    const scenes = (scriptResult.scenes || []).slice(0, sceneCount);

    // Generate all images in parallel
    const imagePrompts = scenes.map(scene => {
      const stylePrompt = `Children's animated film, ${config.complexity} style, ${quality === 'cinematico' ? 'cinematic cinematography' : 'vibrant animation'}. ${scene.visual_prompt}`;
      return base44.integrations.Core.GenerateImage({ prompt: stylePrompt });
    });

    const [coverImage, ...sceneImages] = await Promise.all([
      base44.integrations.Core.GenerateImage({
        prompt: `Movie poster for "${title}". Children's animated film, ${quality === 'cinematico' ? 'cinematic' : 'vibrant'} style, professional, eye-catching, target age ${targetAge}`
      }),
      ...imagePrompts
    ]);

    // Generate audio for scenes (narrator and dialogue)
    const audioPromises = scenes.map(async (scene, idx) => {
      const audioData = {};

      if (scene.narrator_text) {
        try {
          const narratorRes = await base44.functions.invoke('elevenLabsSpeech', {
            text: scene.narrator_text,
            voice_id: "21m00Tcm4TlvDq8ikWAM",
            stability: 0.6,
            similarity_boost: 0.8
          });
          if (narratorRes.data?.audio_url) audioData.narrator_audio_url = narratorRes.data.audio_url;
        } catch (e) { /* audio optional */ }
      }

      if (scene.dialogue) {
        try {
          const dialogueRes = await base44.functions.invoke('elevenLabsSpeech', {
            text: scene.dialogue,
            voice_id: "pNInz6obpgDQGcFmaJgB",
            stability: 0.5,
            similarity_boost: 0.75
          });
          if (dialogueRes.data?.audio_url) audioData.audio_url = dialogueRes.data.audio_url;
        } catch (e) { /* audio optional */ }
      }

      return audioData;
    });

    const audioResults = await Promise.all(audioPromises);

    // Assemble final generated scenes
    const generatedScenes = scenes.map((scene, idx) => ({
      scene_number: scene.scene_number,
      image_url: sceneImages[idx]?.url || '',
      scene_description: scene.scene_description,
      action: scene.scene_description,
      dialogue: scene.dialogue,
      narrator_text: scene.narrator_text,
      sound_effect: scene.sound_effect,
      camera_angle: scene.camera_angle,
      transition: scene.transition,
      emotional_beat: scene.emotional_beat,
      ...audioResults[idx]
    }));

    // Create the VideoProject entity
    const project = await base44.entities.VideoProject.create({
      title: scriptResult.title || title,
      type: "children_film",
      story,
      style: "pixar_3d",
      target_age: targetAge,
      language,
      duration_minutes: duration,
      scene_count: sceneCount,
      character_descriptions: characters,
      generated_scenes: generatedScenes,
      cover_image_url: coverImage.url,
      synopsis: scriptResult.synopsis,
      moral_lesson: scriptResult.moral_lesson,
      genre: "Animated Film",
      music_mood: "magical",
      status: "completed"
    });

    return Response.json({
      success: true,
      project,
      stats: {
        duration_minutes: duration,
        quality,
        scene_count: sceneCount,
        total_processing_time: "varies by quality"
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});