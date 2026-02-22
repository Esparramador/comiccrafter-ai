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
    setGenerationStatus("Creando el guion y estructura del cómic...");

    const validCharacters = characters.filter(c => c.name);
    const characterDescriptions = validCharacters.map(c => 
      `${c.name}: ${c.description}${c.photo_url ? " (tiene foto de referencia)" : ""}`
    ).join("\n");

    // Step 1: Generate the script — full panel-level breakdown
    const scriptResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a master comic book writer and storyboard artist. Create a DETAILED, professional comic script.

TITLE: ${title}
STORY: ${story}
CHARACTERS: ${characterDescriptions}
VISUAL STYLE: ${style}
TOTAL PAGES: ${pageCount}

For EACH page produce:
1. panel_count: number of panels (2–6, vary for pacing)
2. panel_descriptions: detailed visual description of ALL panels on that page (camera angles, character poses, expressions, backgrounds, lighting)
3. dialogues: all speech/thought bubbles with character names and balloon positions (top-left, center, bottom-right, etc.)
4. visual_prompt: a single cohesive image-generation prompt for the full page, written in English, that describes the page layout, all panels, characters referencing their descriptions, environment, mood, lighting. Always include: "comic book page, multiple panels with black borders, professional comic art, ${style} style, masterpiece, 8k, cinematic lighting, sharp detailed lines"
5. page_summary: one sentence describing what happens on this page

Make the story dramatic, with great pacing and emotional impact. Write in the same language as the story (except visual_prompt which must be in English).`,
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
    });

    setGenerationStatus("Generando ilustraciones...");
    const pages = scriptResult.pages || [];
    const generatedPages = [];

    // Step 2: Generate images for each page
    for (let i = 0; i < Math.min(pages.length, pageCount); i++) {
      setGenerationProgress(i + 1);
      setGenerationStatus(`Dibujando página ${i + 1} de ${pageCount}...`);

      const page = pages[i];
      const styleMap = {
        manga: "Japanese manga style, black and white ink, screentones, dynamic action lines, expressive characters",
        anime: "High quality anime illustration style, vibrant colors, detailed shading, beautiful lighting",
        american_comic: "American comic book style, bold colors, strong ink lines, dynamic poses, dramatic lighting",
        noir: "Film noir style, high contrast black and white, dramatic shadows, moody atmosphere",
        watercolor: "Watercolor painting style, soft colors, flowing textures, artistic brushstrokes",
        ligne_claire: "Ligne claire style, clean precise lines, flat colors, European comic aesthetic",
        cyberpunk: "Cyberpunk style, neon colors, futuristic technology, dark urban environments, glowing effects",
        fantasy: "Epic fantasy illustration, magical lighting, detailed environments, rich colors"
      };

      const characterRefPhotos = validCharacters
        .filter(c => c.photo_url)
        .map(c => c.photo_url);

      // Build InstantID-style prompt: style descriptor + visual_prompt + character identity injection
      const identityRef = validCharacters.map(c =>
        `${c.name} (${c.description || "main character"}${c.photo_url ? ", use reference photo for face likeness" : ""})`
      ).join("; ");

      const imagePrompt = `${styleMap[style]}, comic book page with ${page.panel_count || 4} panels separated by black borders. ${page.visual_prompt}. Characters: ${identityRef}. Dialogues/text placement: ${page.dialogues || ""}. High detail, expressive faces with realistic likeness to reference photos, professional comic page layout, speech bubbles with text, masterpiece quality, 8k.`;

      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt,
        ...(characterRefPhotos.length > 0 ? { existing_image_urls: characterRefPhotos } : {})
      });

      generatedPages.push({
        page_number: i + 1,
        image_url: imageResult.url,
        panel_descriptions: page.panel_descriptions,
        dialogues: page.dialogues,
        page_summary: page.page_summary,
        panel_count: page.panel_count
      });
    }

    // Step 3: Generate cover
    setGenerationStatus("Creando la portada...");
    const coverResult = await base44.integrations.Core.GenerateImage({
      prompt: `Epic comic book cover for "${title}". ${style} style. Featuring characters: ${characterDescriptions}. Professional comic book cover with title text, dramatic composition, vibrant colors. Cinematic quality.`,
      ...(validCharacters.filter(c => c.photo_url).length > 0
        ? { existing_image_urls: validCharacters.filter(c => c.photo_url).map(c => c.photo_url) }
        : {})
    });

    // Step 4: Save to database
    setGenerationStatus("Guardando tu cómic...");
    const comic = await base44.entities.ComicProject.create({
      title,
      story,
      style,
      page_count: pageCount,
      character_photos: validCharacters.filter(c => c.photo_url).map(c => c.photo_url),
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
        {step === 1 && <StoryStep title={title} setTitle={setTitle} story={story} setStory={setStory} />}
        {step === 2 && <StyleStep style={style} setStyle={setStyle} pageCount={pageCount} setPageCount={setPageCount} />}
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