import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Film, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


import ShortsCharacterStep from "@/components/shorts/ShortsCharacterStep";
import ShortsStoryStep from "@/components/shorts/ShortsStoryStep";
import ShortsStyleStep from "@/components/shorts/ShortsStyleStep";
import ShortsGenerateStep from "@/components/shorts/ShortsGenerateStep";
import ShortsViewer from "@/components/shorts/ShortsViewer";

const STEPS = ["Personajes", "Historia", "Estilo", "Generar"];

export default function AnimatedShorts() {
  const [step, setStep] = useState(0);
  const [characters, setCharacters] = useState([{ name: "", description: "", photo_url: "" }]);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [language, setLanguage] = useState("es");
  const [style, setStyle] = useState("anime");
  const [frameCount, setFrameCount] = useState(8);
  const [customPrompt, setCustomPrompt] = useState("");

  const [draftId, setDraftId] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [generatedShort, setGeneratedShort] = useState(null);

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
      setCharacters(data.characters || [{ name: "", description: "", photo_url: "" }]);
      setTitle(data.title || "");
      setStory(data.story || "");
      setStyle(data.style || "anime");
      setFrameCount(data.frameCount || 8);
      setCustomPrompt(data.customPrompt || "");
      setLanguage(data.language || "es");
    });
  }, []);

  // Auto-save draft on every change
  useEffect(() => {
    if (isGenerating) return;
    const data = { characters, title, story, style, frameCount, customPrompt, language };
    const saveTitle = title || "Borrador corto";
    if (draftId) {
      base44.entities.Draft.update(draftId, { title: saveTitle, data }).catch(() => {
        // Draft was deleted, create a new one
        setDraftId(null);
        if (title || story || characters.some(c => c.name)) {
          base44.entities.Draft.create({ title: saveTitle, type: "short", data }).then(d => setDraftId(d.id));
        }
      });
    } else if (title || story || characters.some(c => c.name)) {
      base44.entities.Draft.create({ title: saveTitle, type: "short", data }).then(d => setDraftId(d.id));
    }
  }, [characters, title, story, style, frameCount, customPrompt, language, isGenerating]);

  const canAdvance = () => {
    if (step === 0) return characters.some(c => c.name?.trim() !== "");
    if (step === 1) return title.trim() !== "" && story.length > 20;
    if (step === 2) return true;
    return false;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Escribiendo el guion animado...");

    const validChars = characters.filter(c => c.name?.trim());
    const charDescriptions = validChars.map(c =>
      `${c.name}: ${c.description || "protagonist"}${c.photo_url ? " (has reference photo)" : ""}`
    ).join("\n");
    const charPhotos = validChars.filter(c => c.photo_url).map(c => c.photo_url);
    const identityRef = validChars.map(c =>
      `${c.name} (${c.description || "main character"})`
    ).join("; ");

    const styleMap = {
      anime: "High quality anime illustration, vibrant colors, dynamic action, expressive faces, dramatic lighting, studio quality",
      manga: "Japanese manga style, black and white ink, screentones, motion lines, cinematic composition",
      one_piece: "One Piece anime style, bold outlines, vibrant colors, exaggerated expressions, adventure aesthetic, Oda art style",
      naruto: "Naruto anime style, ninja action, chakra effects, dynamic poses, orange and blue palette, Kishimoto art style",
      inuyasha: "Inuyasha anime style, feudal Japan setting, supernatural elements, dramatic lighting, Rumiko Takahashi art style",
      cyberpunk_anime: "Cyberpunk anime style, neon lights, futuristic Japan, tech aesthetic, Ghost in the Shell inspired",
      fantasy_anime: "Epic fantasy anime style, magical effects, detailed environments, Dragon Ball Z energy, rich colors"
    };
    const activeStyle = customPrompt || styleMap[style];

    const langNames = { es: "Spanish", en: "English", fr: "French", ja: "Japanese", pt: "Portuguese" };
    const langName = langNames[language] || "Spanish";

    // Generate script
    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional anime/manga animated short writer with deep knowledge of series like ONE PIECE, Naruto, Inuyasha, Dragon Ball, Bleach, Attack on Titan, Demon Slayer, My Hero Academia, and Sword Art Online.

Create a ${frameCount}-frame animated short storyboard with the feel of a high-quality anime short film.

TITLE: ${title}
STORY: ${story}
CHARACTERS: ${charDescriptions}
STYLE: ${style}
LANGUAGE FOR DIALOGUES: ${langName}
TOTAL FRAMES: ${frameCount}

## MANGA/ANIME STRUCTURE RULES:
- Open with an IMPACT FRAME — grab attention immediately (action, mystery, or emotional hook)
- Use the classic manga pacing: slow build → rising tension → explosive climax → emotional resolution
- Inspired by: ONE PIECE (adventure, friendship, emotional depth), Naruto (determination, bonds, action), Inuyasha (supernatural drama, romance, conflict)
- Each frame must feel like a KEY MOMENT — no filler frames
- Use dynamic camera angles: extreme close-ups on eyes for emotion, wide establishing shots, low angles for power
- Include iconic manga moments: power-up scenes, dramatic reveals, emotional declarations
- Dialogues must feel authentic to anime — passionate, dramatic, with character-specific speech patterns
- Frame transitions should feel like an animated sequence (match cuts, action continuity)

## OUTPUT: For each frame provide:
- frame_number (1 to ${frameCount})
- camera_angle (extreme close-up / close-up / medium / wide / bird's eye / low angle / dutch angle)
- scene_description (vivid visual: lighting, atmosphere, character poses, expressions, background)
- action (what is happening — movement, action, emotion)
- dialogue (speech bubbles / internal monologue in ${langName} — keep punchy, max 20 words per bubble)
- sound_effect (anime-style SFX in ${langName}: e.g. "¡BOOM!", "SHHHIIING", "CRACK")
- visual_prompt (English only — detailed image generation prompt for this exact frame)
- transition (cut / smash cut / fade / zoom in / zoom out / pan / wipe)
- emotional_beat (the emotional tone of this frame: tense / excited / sad / triumphant / mysterious / etc.)

ALL dialogues MUST be in ${langName}. visual_prompt MUST be in English.`,
      response_json_schema: {
        type: "object",
        properties: {
          short_title: { type: "string" },
          genre: { type: "string" },
          synopsis: { type: "string" },
          frames: {
            type: "array",
            items: {
              type: "object",
              properties: {
                frame_number: { type: "number" },
                camera_angle: { type: "string" },
                scene_description: { type: "string" },
                action: { type: "string" },
                dialogue: { type: "string" },
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

    const frames = (scriptResult.frames || []).slice(0, frameCount);
    setStatus(`Dibujando ${frames.length} fotogramas animados...`);
    setProgress(0);

    // Generate cover + all frames in parallel
    let completed = 0;
    const [coverResult, ...frameResults] = await Promise.all([
      base44.integrations.Core.GenerateImage({
        prompt: `Anime short film title card for "${title}". ${activeStyle}. Characters: ${identityRef}. Cinematic widescreen composition, dramatic lighting, epic atmosphere, movie poster quality, 16:9 aspect ratio.`,
        ...(charPhotos.length > 0 ? { existing_image_urls: charPhotos } : {})
      }),
      ...frames.map((frame) => {
        const prompt = `${activeStyle}, animated short film frame, ${frame.camera_angle || "medium shot"}. ${frame.visual_prompt}. Characters: ${identityRef}. Cinematic quality, anime keyframe art, expressive, dynamic composition, masterpiece.`;
        return base44.integrations.Core.GenerateImage({
          prompt,
          ...(charPhotos.length > 0 ? { existing_image_urls: charPhotos } : {})
        }).then(result => {
          completed++;
          setProgress(completed);
          setStatus(`Fotogramas completados: ${completed} de ${frames.length}...`);
          return { frame, result };
        });
      })
    ]);

    const generatedFrames = frameResults.map(({ frame, result }) => ({
      frame_number: frame.frame_number,
      image_url: result.url,
      scene_description: frame.scene_description,
      action: frame.action,
      dialogue: frame.dialogue,
      sound_effect: frame.sound_effect,
      camera_angle: frame.camera_angle,
      transition: frame.transition,
      emotional_beat: frame.emotional_beat,
      visual_prompt: frame.visual_prompt
    }));

    setStatus("Guardando el corto animado...");

    const short = await base44.entities.AnimatedShort.create({
      title,
      story,
      style,
      language,
      frame_count: frameCount,
      character_descriptions: validChars,
      generated_frames: generatedFrames,
      cover_image_url: coverResult.url,
      synopsis: scriptResult.synopsis || story.slice(0, 200),
      genre: scriptResult.genre || "Anime Adventure",
      status: "completed"
    });

    setIsGenerating(false);
    if (draftId) await base44.entities.Draft.delete(draftId);
    setGeneratedShort(short);
  };

  if (generatedShort) {
    return <ShortsViewer short={generatedShort} onBack={() => setGeneratedShort(null)} />;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium mb-4">
            <Film className="w-3.5 h-3.5" />
            Cortos Animados IA
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Crea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Corto Animado</span>
          </h1>
          <p className="text-gray-400 text-sm">Genera un corto animado estilo anime con IA — inspirado en One Piece, Naruto, Inuyasha y más</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                i === step ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                : i < step ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "text-gray-600 border border-white/5"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < step ? "bg-violet-500 text-white" : i === step ? "bg-pink-500 text-white" : "bg-white/5 text-gray-600"
                }`}>{i < step ? "✓" : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? "bg-violet-500/40" : "bg-white/5"}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 0 && <ShortsCharacterStep characters={characters} setCharacters={setCharacters} />}
            {step === 1 && <ShortsStoryStep title={title} setTitle={setTitle} story={story} setStory={setStory} language={language} setLanguage={setLanguage} characters={characters} />}
            {step === 2 && <ShortsStyleStep style={style} setStyle={setStyle} frameCount={frameCount} setFrameCount={setFrameCount} customPrompt={customPrompt} setCustomPrompt={setCustomPrompt} />}
            {step === 3 && (
              <ShortsGenerateStep
                title={title} story={story} style={style}
                frameCount={frameCount} characters={characters}
                isGenerating={isGenerating}
                progress={progress} status={status}
                totalFrames={frameCount}
                onGenerate={handleGenerate}
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
            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 rounded-xl gap-2 disabled:opacity-30"
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