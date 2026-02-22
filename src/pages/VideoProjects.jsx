import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Film, Baby, Clapperboard, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import VideoTypeStep from "@/components/video/VideoTypeStep.jsx";
import VideoCharacterStep from "@/components/video/VideoCharacterStep.jsx";
import VideoSurveyStep from "@/components/video/VideoSurveyStep.jsx";
import VideoStyleStep from "@/components/video/VideoStyleStep.jsx";
import VideoGenerateStep from "@/components/video/VideoGenerateStep.jsx";
import VideoViewer from "@/components/video/VideoViewer.jsx";

const STEPS = ["Tipo", "Personajes", "Encuesta", "Estilo", "Generar"];

export default function VideoProjects() {
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState("children_film");
  const [targetAge, setTargetAge] = useState("3-6");
  const [characters, setCharacters] = useState([{ name: "", description: "", photo_url: "", voice_profile: null, elevenlabs_voice_id: "" }]);
  const [selectedGenre, setSelectedGenre] = useState("adventure");
  const [selectedThemes, setSelectedThemes] = useState(["friendship"]);
  const [tone, setTone] = useState("inspirador");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [moralLesson, setMoralLesson] = useState("");
  const [language, setLanguage] = useState("es");
  const [style, setStyle] = useState("cartoon_2d");
  const [sceneCount, setSceneCount] = useState(10);
  const [musicMood, setMusicMood] = useState("magical");
  const [customPrompt, setCustomPrompt] = useState("");
  const [narratorVoiceId, setNarratorVoiceId] = useState("");

  const [draftId, setDraftId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [generatedProject, setGeneratedProject] = useState(null);

  // Load draft from URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("draftId");
    if (!id) return;
    base44.entities.Draft.filter({ id }).then(results => {
      const d = results[0];
      if (!d) return;
      const data = d.data || {};
      setDraftId(d.id);
      setProjectType(data.projectType || "children_film");
      setTargetAge(data.targetAge || "3-6");
      setCharacters(data.characters || [{ name: "", description: "", photo_url: "", voice_profile: null, elevenlabs_voice_id: "" }]);
      setSelectedGenre(data.selectedGenre || "adventure");
      setSelectedThemes(data.selectedThemes || ["friendship"]);
      setTone(data.tone || "inspirador");
      setTitle(data.title || "");
      setStory(data.story || "");
      setMoralLesson(data.moralLesson || "");
      setLanguage(data.language || "es");
      setStyle(data.style || "cartoon_2d");
      setSceneCount(data.sceneCount || 10);
      setMusicMood(data.musicMood || "magical");
      setCustomPrompt(data.customPrompt || "");
      setNarratorVoiceId(data.narratorVoiceId || "");
    });
  }, []);

  const canAdvance = () => {
    if (step === 0) return !!projectType;
    if (step === 1) return characters.some(c => c.name?.trim());
    if (step === 2) return title.trim() !== "" && story.length > 20;
    if (step === 3) return true;
    return false;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Escribiendo el guion...");

    // Save draft when generation starts
    const data = { projectType, targetAge, characters, selectedGenre, selectedThemes, tone, title, story, moralLesson, language, style, sceneCount, musicMood, customPrompt, narratorVoiceId };
    const saveTitle = title || "Borrador vídeo";
    let activeDraftId = draftId;
    if (activeDraftId) {
      await base44.entities.Draft.update(activeDraftId, { title: saveTitle, data }).catch(async () => {
        const d = await base44.entities.Draft.create({ title: saveTitle, type: "video", data });
        activeDraftId = d.id;
        setDraftId(d.id);
      });
    } else {
      const d = await base44.entities.Draft.create({ title: saveTitle, type: "video", data });
      activeDraftId = d.id;
      setDraftId(d.id);
    }

    const validChars = characters.filter(c => c.name?.trim());
    const charDescriptions = validChars.map(c =>
      `${c.name}: ${c.description || "protagonist"}${c.photo_url ? " (has reference photo)" : ""}`
    ).join("\n");
    const charPhotos = validChars.filter(c => c.photo_url).map(c => c.photo_url);
    const identityRef = validChars.map(c => `${c.name} (${c.description || "main character"})`).join("; ");

    const styleMap = {
      cartoon_2d: "Vibrant 2D cartoon animation style, colorful, expressive characters, clean lines, Cartoon Network inspired",
      pixar_3d: "Pixar/Disney 3D animation style, warm lighting, detailed textures, emotionally expressive characters",
      watercolor: "Soft watercolor illustration style, pastel colors, gentle textures, storybook aesthetic",
      storybook: "Classic children's book illustration, whimsical, warm colors, hand-drawn feel",
      anime: "Studio Ghibli anime style, lush backgrounds, expressive faces, magical atmosphere",
      manga: "Black and white manga style with color accents, expressive, dynamic",
      disney_classic: "Classic Disney 2D animation style, fluid movement, expressive eyes, vibrant palette"
    };
    const activeStyle = customPrompt || styleMap[style];
    const langNames = { es: "Spanish", en: "English", fr: "French", ja: "Japanese", pt: "Portuguese" };
    const langName = langNames[language] || "Spanish";

    const ageGuide = {
      "0-3": "Very simple, short sentences, repetition, bright colors, gentle action",
      "3-6": "Simple vocabulary, magic and imagination, friendly characters, clear morals",
      "6-10": "Adventure, friendship, problem-solving, humor, light drama",
      "10-14": "Deeper emotions, personal growth, some conflict and challenge",
      "all_ages": "Universal themes, multiple levels of meaning, humor for adults and children"
    };

    const typeGuide = {
      short_film: "cinematic short film with strong narrative arc",
      children_film: "children's animated film with clear moral lesson",
      animated_series_ep: "animated series episode with recurring characters",
      music_video: "musical animated video with rhythm and energy",
      documentary_short: "animated educational documentary"
    };

    // Step 1: Generate script
    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a master children's animated content creator and screenwriter, expert in creating ${typeGuide[projectType]}.

TITLE: ${title}
STORY: ${story}
CHARACTERS: ${charDescriptions}
STYLE: ${style}
TARGET AGE: ${targetAge} years (${ageGuide[targetAge]})
MORAL/LESSON: ${moralLesson || "friendship, kindness, courage"}
LANGUAGE: ${langName}
TOTAL SCENES: ${sceneCount}
MUSIC MOOD: ${musicMood}

## STORYTELLING RULES:
- Age-appropriate content for ${targetAge} year olds
- Clear, simple narrative with beginning → development → happy resolution
- Each scene must be visual and engaging
- Include narrator text for scene transitions (warm, storytelling voice)
- Dialogue must match the character's age and personality
- Include a clear moral lesson woven naturally into the story
- Make it magical, fun, and emotionally resonant

## OUTPUT: For each scene:
- scene_number (1 to ${sceneCount})
- scene_description (vivid visual description of what we see)
- camera_angle (close-up / medium / wide / bird's eye / low angle)
- action (what characters are doing)
- dialogue (character speech in ${langName}, simple and age-appropriate)
- narrator_text (narrator voiceover text in ${langName}, warm storytelling tone)
- sound_effect (ambient sounds, ${langName})
- transition (cut / fade / dissolve / wipe)
- emotional_beat (happy / tense / mysterious / funny / sad / triumphant / calm)
- visual_prompt (English only — detailed image generation prompt for this scene)

ALL dialogue and narrator_text MUST be in ${langName}. visual_prompt MUST be in English.`,
      response_json_schema: {
        type: "object",
        properties: {
          film_title: { type: "string" },
          genre: { type: "string" },
          synopsis: { type: "string" },
          moral_lesson: { type: "string" },
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scene_number: { type: "number" },
                scene_description: { type: "string" },
                camera_angle: { type: "string" },
                action: { type: "string" },
                dialogue: { type: "string" },
                narrator_text: { type: "string" },
                sound_effect: { type: "string" },
                visual_prompt: { type: "string" },
                transition: { type: "string" },
                emotional_beat: { type: "string" }
              }
            }
          }
        }
      }
    });

    const scenes = (scriptResult.scenes || []).slice(0, sceneCount);
    setStatus(`Dibujando ${scenes.length} escenas...`);
    setProgress(0);

    // Step 2: Generate cover + all scene images in parallel
    let completed = 0;
    const [coverResult, ...sceneResults] = await Promise.all([
      base44.integrations.Core.GenerateImage({
        prompt: `Children's animated film title card for "${title}". ${activeStyle}. Characters: ${identityRef}. Warm, inviting, magical atmosphere, movie poster quality, suitable for children age ${targetAge}.`,
        ...(charPhotos.length > 0 ? { existing_image_urls: charPhotos } : {})
      }),
      ...scenes.map(scene => {
        const prompt = `${activeStyle}, children's animated film scene, ${scene.camera_angle || "medium shot"}. ${scene.visual_prompt}. Characters: ${identityRef}. Bright, colorful, child-friendly, cinematic quality.`;
        return base44.integrations.Core.GenerateImage({
          prompt,
          ...(charPhotos.length > 0 ? { existing_image_urls: charPhotos } : {})
        }).then(result => {
          completed++;
          setProgress(completed);
          setStatus(`Escenas completadas: ${completed} de ${scenes.length}...`);
          return { scene, result };
        });
      })
    ]);

    setStatus("Generando voces con ElevenLabs...");

    // Step 3: Generate audio for dialogues and narrator using ElevenLabs
    const scenesWithImages = sceneResults.map(({ scene, result }) => ({
      scene_number: scene.scene_number,
      image_url: result.url,
      scene_description: scene.scene_description,
      action: scene.action,
      dialogue: scene.dialogue,
      narrator_text: scene.narrator_text,
      sound_effect: scene.sound_effect,
      camera_angle: scene.camera_angle,
      transition: scene.transition,
      emotional_beat: scene.emotional_beat,
      visual_prompt: scene.visual_prompt
    }));

    // Generate audio for scenes that have dialogue or narrator text
    const audioPromises = scenesWithImages.map(async scene => {
      const audioResults = {};

      // Narrator audio
      if (scene.narrator_text) {
        try {
          const res = await base44.functions.invoke('elevenLabsSpeech', {
            text: scene.narrator_text,
            voice_id: narratorVoiceId || "21m00Tcm4TlvDq8ikWAM",
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.2
          });
          if (res.data?.audio_url) audioResults.narrator_audio_url = res.data.audio_url;
        } catch (e) { /* audio optional */ }
      }

      // Dialogue audio - use character's assigned voice if available
      if (scene.dialogue) {
        try {
          const speakingChar = validChars.find(c =>
            scene.dialogue.toLowerCase().includes(c.name?.toLowerCase())
          ) || validChars[0];
          const voiceId = speakingChar?.elevenlabs_voice_id ||
            speakingChar?.voice_profile?.elevenlabs_voice_id ||
            "pNInz6obpgDQGcFmaJgB";
          const res = await base44.functions.invoke('elevenLabsSpeech', {
            text: scene.dialogue,
            voice_id: voiceId,
            stability: 0.5,
            similarity_boost: 0.75
          });
          if (res.data?.audio_url) audioResults.audio_url = res.data.audio_url;
        } catch (e) { /* audio optional */ }
      }

      return { ...scene, ...audioResults };
    });

    const generatedScenes = await Promise.all(audioPromises);

    setStatus("Guardando el proyecto...");

    const project = await base44.entities.VideoProject.create({
      title,
      type: projectType,
      story,
      style,
      target_age: targetAge,
      language,
      duration_minutes: Math.round(sceneCount * 0.5),
      scene_count: sceneCount,
      character_descriptions: validChars,
      generated_scenes: generatedScenes,
      cover_image_url: coverResult.url,
      synopsis: scriptResult.synopsis || story.slice(0, 200),
      moral_lesson: scriptResult.moral_lesson || moralLesson,
      genre: scriptResult.genre || "Animated Film",
      music_mood: musicMood,
      status: "completed"
    });

    setIsGenerating(false);
    // Delete draft on successful completion
    if (activeDraftId) await base44.entities.Draft.delete(activeDraftId).catch(() => {});
    setGeneratedProject(project);
  };

  if (generatedProject) {
    return <VideoViewer project={generatedProject} onBack={() => setGeneratedProject(null)} />;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <Baby className="w-3.5 h-3.5" />
            Vídeos & Cortometrajes IA + ElevenLabs
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Crea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">Cortometraje</span>
          </h1>
          <p className="text-gray-400 text-sm">Genera cortometrajes infantiles y vídeos animados con voces profesionales de ElevenLabs</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                i === step ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                : i < step ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "text-gray-600 border border-white/5"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-yellow-500 text-white" : "bg-white/5 text-gray-600"
                }`}>{i < step ? "✓" : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-4 ${i < step ? "bg-green-500/40" : "bg-white/5"}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 0 && (
              <VideoTypeStep
                projectType={projectType} setProjectType={setProjectType}
                targetAge={targetAge} setTargetAge={setTargetAge}
              />
            )}
            {step === 1 && (
              <VideoCharacterStep
                characters={characters} setCharacters={setCharacters}
                narratorVoiceId={narratorVoiceId} setNarratorVoiceId={setNarratorVoiceId}
              />
            )}
            {step === 2 && (
              <VideoStoryStep
                title={title} setTitle={setTitle}
                story={story} setStory={setStory}
                moralLesson={moralLesson} setMoralLesson={setMoralLesson}
                language={language} setLanguage={setLanguage}
                projectType={projectType} targetAge={targetAge}
              />
            )}
            {step === 3 && (
              <VideoStyleStep
                style={style} setStyle={setStyle}
                sceneCount={sceneCount} setSceneCount={setSceneCount}
                musicMood={musicMood} setMusicMood={setMusicMood}
                customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
                targetAge={targetAge}
              />
            )}
            {step === 4 && (
              <VideoGenerateStep
                title={title} story={story} style={style}
                sceneCount={sceneCount} characters={characters}
                projectType={projectType} targetAge={targetAge}
                isGenerating={isGenerating} progress={progress} status={status}
                totalScenes={sceneCount} onGenerate={handleGenerate}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {!isGenerating && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Atrás
            </Button>
            {step < 4 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="bg-gradient-to-r from-yellow-600 to-pink-600 hover:from-yellow-500 hover:to-pink-500 rounded-xl gap-2 disabled:opacity-30"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}