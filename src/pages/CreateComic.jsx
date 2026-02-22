import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

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
  const [draftId, setDraftId] = useState(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");

  // Load draft from URL param on mount (for resuming interrupted generations)
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
      setPageCount(data.pageCount || 6);
      setCustomPrompt(data.customPrompt || "");
      setLanguage(data.language || "es");
      setStep(data.step || 0);
    });
  }, []);

  const canAdvance = () => {
    if (step === 0) return characters.some(c => c.name && c.name.trim() !== "");
    if (step === 1) return title && title.trim() !== "" && story.length > 20;
    if (step === 2) return true;
    return true;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus("Creando el guion...");

    // Save draft only when generation starts (to allow resume if app closes mid-generation)
    const data = { characters, title, story, style, pageCount, customPrompt, language, step };
    const saveTitle = title || "Borrador cómic";
    let activeDraftId = draftId;
    if (activeDraftId) {
      await base44.entities.Draft.update(activeDraftId, { title: saveTitle, data }).catch(async () => {
        const d = await base44.entities.Draft.create({ title: saveTitle, type: "comic", data });
        activeDraftId = d.id;
        setDraftId(d.id);
      });
    } else {
      const d = await base44.entities.Draft.create({ title: saveTitle, type: "comic", data });
      activeDraftId = d.id;
      setDraftId(d.id);
    }

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
        prompt: `You are an expert comic book writer AND a professional narrative writer with deep knowledge of classical story structure and linguistic correctness (following RAE standards for Spanish or equivalent authorities for other languages).

TITLE: ${title}
STORY: ${story}
CHARACTERS: ${characterDescriptions}
STYLE: ${style}
PAGES: ${pageCount}
LANGUAGE FOR DIALOGUES: ${languageName}

## NARRATIVE STRUCTURE RULES (apply strictly):
Distribute the ${pageCount} pages following the classic three-act structure:
- ACT 1 — PLANTEAMIENTO (first ~25% of pages): Introduce characters, setting and the initial situation. Hook the reader immediately. Establish the conflict seed.
- ACT 2 — NUDO / DESARROLLO (middle ~50% of pages): Escalate the conflict, add complications, character development, emotional peaks. Each page must raise tension or reveal something new. Include a mid-point twist if possible.
- ACT 3 — DESENLACE (final ~25% of pages): Resolve the central conflict satisfyingly. Provide emotional closure. The last page must leave a strong final impression (emotional, visual or narrative punch).

## WRITING QUALITY RULES:
- Dialogues must be natural, character-specific (each character has a distinct voice) and emotionally engaging.
- Apply correct grammar, spelling and syntax following the standards of the ${languageName} language.
- Use varied, rich vocabulary — avoid repetition of the same words.
- Sentences in speech bubbles should be concise (max 15-20 words per bubble) and punchy.
- Panel descriptions must be vivid and cinematically precise (camera angle, lighting, emotion on faces, body language).
- Maintain narrative coherence: events, character actions and emotional arcs must be consistent across all pages.

## OUTPUT FORMAT — For each page provide:
- panel_count (2-5 panels per page, vary it for rhythm)
- panel_descriptions (detailed visual description of each panel including camera angle, mood and action)
- dialogues (all speech bubbles and captions, written ONLY in ${languageName}, respecting grammar and spelling rules)
- visual_prompt (English only — image generation prompt: "${styleMap[style]}, comic page with ${'{panel_count}'} panels, black panel borders, professional comic art, sharp lines, [scene description]")
- page_summary (one sentence, what happens narratively)
- act (1, 2, or 3 — which act this page belongs to)

ALL dialogues and text on panels MUST be in ${languageName}. visual_prompt must ALWAYS be in English.`,
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
                  page_summary: { type: "string" },
                  act: { type: "number" }
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
      panel_count: page.panel_count,
      act: page.act
    }));

    // Step 3: Save and navigate
    setGenerationStatus("Guardando tu cómic...");

    // Upload script as file to avoid field size limits
    const scriptBlob = new Blob([JSON.stringify(scriptResult)], { type: "application/json" });
    const scriptFile = new File([scriptBlob], "script.json", { type: "application/json" });
    const { file_url: scriptUrl } = await base44.integrations.Core.UploadFile({ file: scriptFile });

    const comic = await base44.entities.ComicProject.create({
      title,
      story,
      style,
      page_count: pageCount,
      character_photos: characterRefPhotos,
      character_descriptions: validCharacters,
      generated_pages: generatedPages,
      cover_image_url: coverResult.url,
      script: scriptUrl,
      status: "completed"
    });

    setIsGenerating(false);

    // Delete draft on successful completion
    if (activeDraftId) await base44.entities.Draft.delete(activeDraftId).catch(() => {});

    // Auto-download ZIP
    setGenerationStatus("Generando ZIP para descarga...");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(title || "comic");
      const allImages = [
        ...(coverResult.url ? [{ url: coverResult.url, name: "00_Portada.png" }] : []),
        ...generatedPages.map(p => ({ url: p.image_url, name: `Pag_${String(p.page_number).padStart(2, "0")}.png` }))
      ];
      for (const img of allImages) {
        const res = await fetch(img.url);
        const blob = await res.blob();
        folder.file(img.name, blob);
      }
      let scriptText = `${title}\n${"=".repeat(title.length)}\n\n`;
      generatedPages.forEach(p => { scriptText += `--- Página ${p.page_number} ---\n${p.panel_descriptions || ""}\n\nDiálogos:\n${p.dialogues || ""}\n\n`; });
      folder.file("guion.txt", scriptText);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${title || "comic"}.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
    } catch (e) { /* ZIP optional, don't block navigation */ }

    navigate(createPageUrl("ComicViewer") + `?id=${comic.id}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <StepIndicator currentStep={step} />

        {step === 0 && <CharacterStep characters={characters} setCharacters={setCharacters} />}
        {step === 1 && <StoryStep title={title} setTitle={setTitle} story={story} setStory={setStory} language={language} setLanguage={setLanguage} characters={characters} />}
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