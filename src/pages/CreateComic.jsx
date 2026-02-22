import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

import StepIndicator from "../components/create/StepIndicator";
import CharacterStep from "../components/create/CharacterStep";
import StoryStep from "../components/create/StoryStep";
import StyleStep from "../components/create/StyleStep";
import GenerateStep from "../components/create/GenerateStep";

export default function CreateComic() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Form state
  const [characters, setCharacters] = useState([{ name: "", description: "", photo_url: "" }]);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [style, setStyle] = useState("anime");
  const [pageCount, setPageCount] = useState(6);
  const [customPrompt, setCustomPrompt] = useState("");
  const [language, setLanguage] = useState("es");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");

  const canAdvance = () => {
    if (step === 0) return characters.some(c => c.name);
    if (step === 1) return title && story.length > 20;
    if (step === 2) return true;
    return true;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus("Creando el guion...");

    const validCharacters = characters.filter(c => c.name);
    const characterDescriptions = validCharacters.map(c =>
      `${c.name}: ${c.description}${c.photo_url ? " (has reference photo)" : ""}`
    ).join("\n");

    const characterRefPhotos = validCharacters.filter(c => c.photo_url).map(c => c.photo_url);
    const identityRef = validCharacters.map(c =>
      `${c.name} (${c.description || "main character"}${c.photo_url ? ", match reference photo face" : ""})`
    ).join("; ");

    const styleMap = {
      manga: "Japanese manga style, black and white ink, screentones, dynamic action lines",
      anime: "High quality anime illustration, vibrant colors, detailed shading, beautiful lighting",
      american_comic: "American comic book style, bold colors, strong ink lines, dramatic lighting",
      noir: "Film noir, high contrast black and white, dramatic shadows, moody atmosphere",
      watercolor: "Watercolor painting style, soft colors, flowing textures, artistic brushstrokes",
      ligne_claire: "Ligne claire, clean precise lines, flat colors, European comic aesthetic",
      cyberpunk: "Cyberpunk style, neon colors, futuristic technology, dark urban environments",
      fantasy: "Epic fantasy illustration, magical lighting, detailed environments, rich colors"
    };
    const activeStylePrompt = customPrompt || styleMap[style];
    const langNames = { es: "Spanish", en: "English", fr: "French", de: "German", it: "Italian", pt: "Portuguese", ja: "Japanese", ko: "Korean", zh: "Chinese", ar: "Arabic", ru: "Russian", hi: "Hindi" };
    const languageName = langNames[language] || language;

    // Step 1: Script + cover generated in PARALLEL
    setGenerationStatus("Generando guion y portada...");
    const [scriptResult, coverResult] = await Promise.all([
      base44.integrations.Core.InvokeLLM({
        prompt: `You are a comic book writer. Create a concise but vivid comic script.

TITLE: ${title}
STORY: ${story}
CHARACTERS: ${characterDescriptions}
STYLE: ${style}
PAGES: ${pageCount}

For each page provide:
- panel_count (2-5)
- panel_descriptions (brief visual description)
- dialogues (speech bubbles text)
- visual_prompt (English only, image generation prompt including: "${styleMap[style]}, comic page with panels, black panel borders, professional comic art, sharp lines")
- page_summary (one sentence)

Be concise. Respond in the story's language except visual_prompt must be English.`,
        response_json_schema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_number: { type: "number" },
                  panel_count: { type: "number" },
                  panel_descriptions: { type: "string" },
                  dialogues: { type: "string" },
                  visual_prompt: { type: "string" },
                  page_summary: { type: "string" }
                }
              }
            }
          }
        }
      }),
      base44.integrations.Core.GenerateImage({
        prompt: `Epic comic book cover for "${title}". ${activeStylePrompt}. Characters: ${identityRef}. Dramatic composition, vibrant colors, cinematic quality, professional cover art.`,
        ...(characterRefPhotos.length > 0 ? { existing_image_urls: characterRefPhotos } : {})
      })
    ]);

    const pages = (scriptResult.pages || []).slice(0, pageCount);
    setGenerationStatus(`Dibujando ${pages.length} páginas en paralelo...`);
    setGenerationProgress(0);

    // Step 2: Generate ALL page images in PARALLEL
    let completed = 0;
    const imagePromises = pages.map((page) => {
      const prompt = `${activeStylePrompt}, comic book page with ${page.panel_count || 3} panels, black panel borders. ${page.visual_prompt}. Characters: ${identityRef}. Professional comic layout, speech bubbles, masterpiece, 8k.`;
      return base44.integrations.Core.GenerateImage({
        prompt,
        ...(characterRefPhotos.length > 0 ? { existing_image_urls: characterRefPhotos } : {})
      }).then(result => {
        completed++;
        setGenerationProgress(completed);
        setGenerationStatus(`Páginas completadas: ${completed} de ${pages.length}...`);
        return { page, result };
      });
    });

    const imageResults = await Promise.all(imagePromises);

    const generatedPages = imageResults.map(({ page, result }) => ({
      page_number: page.page_number,
      image_url: result.url,
      panel_descriptions: page.panel_descriptions,
      dialogues: page.dialogues,
      page_summary: page.page_summary,
      panel_count: page.panel_count
    }));

    // Step 3: Save and navigate
    setGenerationStatus("Guardando tu cómic...");
    const comic = await base44.entities.ComicProject.create({
      title,
      story,
      style,
      page_count: pageCount,
      character_photos: characterRefPhotos,
      character_descriptions: validCharacters,
      generated_pages: generatedPages,
      cover_image_url: coverResult.url,
      script: JSON.stringify(scriptResult),
      status: "completed"
    });

    setIsGenerating(false);
    navigate(createPageUrl("ComicViewer") + `?id=${comic.id}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <StepIndicator currentStep={step} />

        {step === 0 && <CharacterStep characters={characters} setCharacters={setCharacters} />}
        {step === 1 && <StoryStep title={title} setTitle={setTitle} story={story} setStory={setStory} language={language} setLanguage={setLanguage} />}
        {step === 2 && <StyleStep style={style} setStyle={setStyle} pageCount={pageCount} setPageCount={setPageCount} customPrompt={customPrompt} setCustomPrompt={setCustomPrompt} />}
        {step === 3 && (
          <GenerateStep
            title={title} story={story} style={style}
            pageCount={pageCount} characters={characters}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            generationStatus={generationStatus}
            onGenerate={handleGenerate}
          />
        )}

        {/* Navigation */}
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
                className="bg-violet-600 hover:bg-violet-500 rounded-xl gap-2 disabled:opacity-30"
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