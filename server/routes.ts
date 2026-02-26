import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema, insertGeneratedImageSchema, insertScriptSchema, insertAppUserSchema, insertServiceLimitSchema, insertSubscriptionPlanSchema } from "@shared/schema";
import { openai, generateImageBuffer } from "./replit_integrations/image/client";
import { manusGenerateImage, manusGenerateImageBuffer, manusChat, manusBatchImages } from "./manus-ai";
import { createTextTo3D, uploadImageToTripo, createImageTo3D, getTaskStatus, downloadModel } from "./tripo3d";
import { generateGalleryBatch } from "./generate-gallery";
import { listVoices, textToSpeech, getVoiceById } from "./elevenlabs";
import { geminiChat } from "./gemini";
import { uploadFileToDrive, listDriveFiles } from "./google-drive";
import { createSpreadsheet, exportDataToSheet, readSheet } from "./google-sheets";
import { sendEmail } from "./google-mail";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Characters CRUD ──
  app.get("/api/characters", async (_req, res) => {
    try {
      const chars = await storage.getAllCharacters();
      res.json(chars);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const parsed = insertCharacterSchema.parse(req.body);
      const char = await storage.createCharacter(parsed);
      res.json(char);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const char = await storage.updateCharacter(id, req.body);
      if (!char) return res.status(404).json({ error: "Not found" });
      res.json(char);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      await storage.deleteCharacter(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Generated Images CRUD ──
  app.get("/api/images", async (_req, res) => {
    try {
      const imgs = await storage.getAllImages();
      res.json(imgs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/images/:id", async (req, res) => {
    try {
      await storage.deleteImage(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Scripts CRUD ──
  app.get("/api/scripts", async (_req, res) => {
    try {
      const scripts = await storage.getAllScripts();
      res.json(scripts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/scripts/:id", async (req, res) => {
    try {
      await storage.deleteScript(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Comic Pages CRUD ──
  app.get("/api/comic-pages", async (_req, res) => {
    try {
      const pages = await storage.getAllComicPages();
      res.json(pages);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/comic-pages/:id", async (req, res) => {
    try {
      await storage.deleteComicPage(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI: Generate Script ──
  app.post("/api/ai/generate-script", async (req, res) => {
    try {
      const { genre, conflict, pacing, length, language, characters: charNames, customPrompt } = req.body;

      let systemPrompt = `Eres un guionista profesional de cómics, manga y novelas gráficas. Generas narrativas estructuradas en español (o en el idioma que se solicite). Estructura la historia con secciones claras: [PLANTEAMIENTO], [NUDO Y DESARROLLO], [GIRO DRAMÁTICO], [DESENLACE]. Sé creativo, cinematográfico y detallado.`;

      let userPrompt = customPrompt || "";
      if (!customPrompt) {
        userPrompt = `Genera un guion completo para un cómic con estas características:
- Género: ${genre || "Cyberpunk / Scifi"}
- Conflicto central: ${conflict || "Salvar al mundo"}
- Ritmo narrativo: ${pacing || "Equilibrado"}
- Longitud: ${length || "Corto (One-shot)"}
- Idioma: ${language || "Español"}`;
        if (charNames && charNames.length > 0) {
          userPrompt += `\n- Personajes principales: ${charNames.join(", ")}`;
        }
      }

      const scriptContent = await manusChat(userPrompt, systemPrompt, "gpt-4o");

      const saved = await storage.createScript({
        title: genre ? `${genre} - Guion IA` : "Guion Generado por IA",
        content: scriptContent,
        genre: genre || "",
        language: language || "Español",
      });

      res.json({ script: scriptContent, saved });
    } catch (e: any) {
      console.error("Script generation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI: Generate Character (Manus Enhanced) ──
  app.post("/api/ai/generate-character", async (req, res) => {
    try {
      const { prompt } = req.body;

      const raw = await manusChat(
        prompt || "Genera un personaje aleatorio para un cómic cyberpunk",
        `Eres un diseñador de personajes para cómics y manga. Dado un prompt, genera un personaje con los siguientes campos en JSON:
{ "name": "...", "role": "...", "description": "..." }
El nombre debe ser creativo. El rol puede ser: Protagonista, Antagonista, Secundario, Mentor, etc. La descripción debe incluir apariencia física, personalidad y lore (2-3 frases). Responde SOLO con el JSON.`,
        "gpt-4o"
      );

      let charData;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        charData = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      } catch {
        charData = { name: "Personaje IA", role: "Secundario", description: raw };
      }

      const imagePrompt = `Professional anime/manga character portrait, ultra detailed, masterpiece quality, ${charData.description || prompt}, clean white background, full character sheet style, vibrant colors, studio lighting`;
      let imageUrl = "";
      try {
        const result = await manusGenerateImage(imagePrompt, "1024x1024", "hd", "vivid");
        imageUrl = result.url;
      } catch (imgErr: any) {
        console.error("Manus image gen failed for character:", imgErr.message);
        try {
          const imgBuffer = await generateImageBuffer(imagePrompt, "1024x1024");
          imageUrl = `data:image/png;base64,${imgBuffer.toString("base64")}`;
        } catch { }
      }

      const saved = await storage.createCharacter({
        name: charData.name || "Personaje IA",
        role: charData.role || "Secundario",
        description: charData.description || "",
        voice: "No asignada",
        has3D: false,
        photoUrls: imageUrl ? [imageUrl] : [],
      });

      res.json(saved);
    } catch (e: any) {
      console.error("Character generation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI: Generate Cover Art (Manus Enhanced) ──
  app.post("/api/ai/generate-cover", async (req, res) => {
    try {
      const { atmosphere, focus, style, format, customPrompt } = req.body;

      let imgPrompt = customPrompt || "";
      if (!customPrompt) {
        imgPrompt = `MASTERPIECE professional comic book cover art, award-winning illustration quality, ultra detailed 8K resolution. Atmosphere: ${atmosphere || "epic cinematic action with dramatic volumetric lighting"}. Central focus: ${focus || "hero in iconic heroic pose with dynamic energy effects"}. Art style: ${style || "premium manga shonen with cel-shading and ink details"}. Format: ${format || "premium chapter cover, portrait composition"}. Features: dramatic chiaroscuro lighting, lens flare effects, particle systems, depth of field, professional color grading, museum-quality print resolution, trending on ArtStation, concept art quality, vivid saturated color palette with complementary contrasts.`;
      }

      let dataUrl: string;
      try {
        const result = await manusGenerateImage(imgPrompt, "1024x1792", "hd", "vivid");
        dataUrl = result.url;
      } catch {
        const imgBuffer = await generateImageBuffer(imgPrompt, "1024x1024");
        dataUrl = `data:image/png;base64,${imgBuffer.toString("base64")}`;
      }

      const saved = await storage.createImage({
        prompt: imgPrompt,
        imageUrl: dataUrl,
        category: "cover",
      });

      res.json({ imageUrl: dataUrl, saved });
    } catch (e: any) {
      console.error("Cover generation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI: Generate Comic Page Panels (Manus Enhanced) ──
  app.post("/api/ai/generate-comic-page", async (req, res) => {
    try {
      const { script, style, panelCount, language, customPrompt } = req.body;

      const panelNum = panelCount || 5;
      const comicStyle = style || "manga shonen";

      const rawPanels = await manusChat(
        customPrompt || script || "Genera una página de cómic de acción cyberpunk",
        `Eres un director de arte de manga/cómic. Dada una idea o guion, genera exactamente ${panelNum} descripciones de viñetas para dibujar, junto con los diálogos/textos de cada viñeta. Responde en JSON:
{ "panels": [ { "imagePrompt": "detailed scene description for image generation...", "dialogue": "Character: text...", "sfx": "sound effect if any" } ] }
Responde SOLO con JSON válido.`,
        "gpt-4o"
      );
      let panelData;
      try {
        const jsonMatch = rawPanels.match(/\{[\s\S]*\}/);
        panelData = JSON.parse(jsonMatch ? jsonMatch[0] : rawPanels);
      } catch {
        panelData = { panels: Array.from({ length: panelNum }, (_, i) => ({
          imagePrompt: `Comic panel ${i + 1}, action scene, ${comicStyle}`,
          dialogue: "",
          sfx: ""
        }))};
      }

      const panels = panelData.panels?.slice(0, panelNum) || [];

      const panelImages: string[] = [];
      for (const panel of panels) {
        try {
          const prompt = `MASTERPIECE ${comicStyle} style comic panel, ultra detailed 8K, professional manga/comic quality, cinematic composition, dramatic lighting, depth of field, vivid colors, ArtStation trending, ${panel.imagePrompt}`;
          try {
            const result = await manusGenerateImage(prompt, "1024x1024", "hd", "vivid");
            panelImages.push(result.url);
          } catch {
            const buf = await generateImageBuffer(prompt, "1024x1024");
            panelImages.push(`data:image/png;base64,${buf.toString("base64")}`);
          }
        } catch (err: any) {
          console.error("Panel image gen failed:", err.message);
          panelImages.push("");
        }
      }

      const saved = await storage.createComicPage({
        title: `Página IA - ${comicStyle}`,
        panelImages,
        panelTexts: panels.map((p: any) => ({ dialogue: p.dialogue || "", sfx: p.sfx || "" })),
        style: comicStyle,
      });

      res.json({ panels, panelImages, saved });
    } catch (e: any) {
      console.error("Comic page generation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI: Generate Single Image (Manus Enhanced) ──
  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { prompt, category, size, quality, style } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      let dataUrl: string;
      try {
        const result = await manusGenerateImage(
          prompt,
          size || "1024x1024",
          quality || "hd",
          style || "vivid"
        );
        dataUrl = result.url;
      } catch {
        const imgBuffer = await generateImageBuffer(prompt, "1024x1024");
        dataUrl = `data:image/png;base64,${imgBuffer.toString("base64")}`;
      }

      const saved = await storage.createImage({
        prompt,
        imageUrl: dataUrl,
        category: category || "general",
      });

      res.json({ imageUrl: dataUrl, saved });
    } catch (e: any) {
      console.error("Image generation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Manus AI: Batch Image Gallery Generator ──
  app.post("/api/ai/manus-gallery", async (req, res) => {
    try {
      const { theme, count, style: artStyle } = req.body;
      const numImages = Math.min(count || 5, 10);

      const promptsRaw = await manusChat(
        `Genera exactamente ${numImages} prompts creativos y detallados para generar imágenes con DALL-E 3 sobre el tema: "${theme || "arte de cómics y manga variado"}". 
Estilo artístico preferido: ${artStyle || "variado (manga, anime, western comics, cyberpunk, fantasía)"}.
Cada prompt debe ser diferente y creativo. Responde SOLO con un JSON array:
["prompt 1", "prompt 2", ...]`,
        "Eres un director de arte experto en cómics, manga y arte digital. Generas prompts extremadamente detallados y creativos para generación de imágenes IA.",
        "gpt-4o"
      );

      let prompts: string[] = [];
      try {
        const match = promptsRaw.match(/\[[\s\S]*\]/);
        prompts = JSON.parse(match ? match[0] : promptsRaw);
      } catch {
        prompts = Array.from({ length: numImages }, (_, i) => 
          `Professional ${artStyle || "manga"} illustration #${i + 1}, ${theme || "epic comic book scene"}, ultra detailed, masterpiece`
        );
      }

      const categories = (theme || "gallery").toLowerCase().replace(/\s+/g, '_');
      const batchPrompts = prompts.slice(0, numImages).map(p => ({
        prompt: p,
        category: categories,
      }));

      const results = await manusBatchImages(batchPrompts);

      const saved = [];
      for (const r of results) {
        const s = await storage.createImage({
          prompt: r.prompt,
          imageUrl: r.imageUrl,
          category: r.category,
        });
        saved.push(s);
      }

      res.json({ generated: saved.length, images: saved });
    } catch (e: any) {
      console.error("Manus gallery error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI: Generate Full Gallery Batch (Covers + Illustrations + Characters) ──
  let galleryBatchRunning = false;
  app.post("/api/ai/generate-gallery-batch", async (_req, res) => {
    if (galleryBatchRunning) {
      return res.json({ started: false, message: "Ya hay una generación en proceso. Las imágenes aparecerán automáticamente." });
    }
    galleryBatchRunning = true;
    res.json({ started: true, message: "Generación iniciada. Las imágenes aparecerán en tu galería conforme se vayan creando." });
    generateGalleryBatch().then(result => {
      console.log(`[GALLERY] Batch complete: ${result.generated} generated, ${result.errors} errors`);
    }).catch(err => {
      console.error("[GALLERY] Batch error:", err);
    }).finally(() => {
      galleryBatchRunning = false;
    });
  });

  app.get("/api/ai/gallery-status", async (_req, res) => {
    res.json({ running: galleryBatchRunning });
  });

  // ── Tripo3D: Generate 3D Model from Text ──
  app.post("/api/ai/generate-3d", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });
      const result = await createTextTo3D(prompt);
      res.json(result);
    } catch (e: any) {
      console.error("3D generation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Upload Image for Image-to-3D ──
  app.post("/api/ai/upload-3d-image", async (req, res) => {
    try {
      const { imageBase64, filename } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "Image data required" });
      const buffer = Buffer.from(imageBase64, "base64");
      const result = await uploadImageToTripo(buffer, filename || "upload.jpg");
      res.json(result);
    } catch (e: any) {
      console.error("3D image upload error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Generate 3D from uploaded image token ──
  app.post("/api/ai/generate-3d-from-image", async (req, res) => {
    try {
      const { imageToken } = req.body;
      if (!imageToken) return res.status(400).json({ error: "Image token required" });
      const result = await createImageTo3D(imageToken);
      res.json(result);
    } catch (e: any) {
      console.error("3D from image error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Poll task status ──
  app.get("/api/ai/3d-status/:taskId", async (req, res) => {
    try {
      const result = await getTaskStatus(req.params.taskId);
      res.json(result);
    } catch (e: any) {
      console.error("3D status error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Download model ──
  app.get("/api/ai/3d-download/:taskId", async (req, res) => {
    try {
      const result = await downloadModel(req.params.taskId);
      res.json(result);
    } catch (e: any) {
      console.error("3D download error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── ElevenLabs: List voices ──
  app.get("/api/voices", async (_req, res) => {
    try {
      const voices = await listVoices();
      res.json(voices);
    } catch (e: any) {
      console.error("Voices list error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── ElevenLabs: Text to Speech ──
  app.post("/api/ai/generate-voice", async (req, res) => {
    try {
      const { voiceId, text, stability, similarity_boost } = req.body;
      if (!voiceId || !text) return res.status(400).json({ error: "voiceId and text required" });
      const audioBuffer = await textToSpeech(voiceId, text, { stability, similarity_boost });
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      });
      res.send(audioBuffer);
    } catch (e: any) {
      console.error("TTS error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── ElevenLabs: Get single voice details ──
  app.get("/api/voices/:voiceId", async (req, res) => {
    try {
      const voice = await getVoiceById(req.params.voiceId);
      res.json(voice);
    } catch (e: any) {
      console.error("Voice detail error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Admin: Stats ──
  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Admin: Users CRUD ──
  app.get("/api/admin/users", async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const users = await storage.getAllAppUsers(search);
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const parsed = insertAppUserSchema.parse(req.body);
      const user = await storage.createAppUser(parsed);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateAppUser(id, req.body);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteAppUser(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Admin: Service Limits CRUD ──
  app.get("/api/admin/service-limits", async (_req, res) => {
    try {
      const limits = await storage.getAllServiceLimits();
      res.json(limits);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/service-limits", async (req, res) => {
    try {
      const parsed = insertServiceLimitSchema.parse(req.body);
      const limit = await storage.createServiceLimit(parsed);
      res.json(limit);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/service-limits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const limit = await storage.updateServiceLimit(id, req.body);
      if (!limit) return res.status(404).json({ error: "Limit not found" });
      res.json(limit);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/service-limits/:id", async (req, res) => {
    try {
      await storage.deleteServiceLimit(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Gemini AI: Enhanced Chat/Analysis ──
  app.post("/api/ai/gemini-chat", async (req, res) => {
    try {
      const { prompt, systemPrompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });
      const response = await geminiChat(prompt, systemPrompt);
      res.json({ response });
    } catch (e: any) {
      console.error("Gemini chat error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Gemini AI: Analyze/Improve Script ──
  app.post("/api/ai/gemini-analyze", async (req, res) => {
    try {
      const { content, type } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const systemPrompts: Record<string, string> = {
        script: "Eres un analista de guiones profesional. Analiza el guion proporcionado y da feedback detallado sobre estructura, ritmo, personajes y diálogos. Sugiere mejoras concretas.",
        character: "Eres un diseñador de personajes experto. Analiza el personaje y sugiere formas de hacerlo más memorable, con conflictos internos más profundos y un arco de desarrollo más interesante.",
        scene: "Eres un director de escenas. Analiza la descripción de la escena y sugiere encuadres, iluminación, composición y momentos dramáticos para maximizar el impacto visual.",
      };

      const sys = systemPrompts[type] || systemPrompts.script;
      const response = await geminiChat(content, sys);
      res.json({ analysis: response });
    } catch (e: any) {
      console.error("Gemini analysis error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Google Drive: Upload & List ──
  app.post("/api/google/drive/upload", async (req, res) => {
    try {
      const { fileName, mimeType, base64Data, folderId } = req.body;
      if (!fileName || !base64Data) return res.status(400).json({ error: "fileName and base64Data required" });
      const buffer = Buffer.from(base64Data, "base64");
      const result = await uploadFileToDrive(fileName, mimeType || "application/octet-stream", buffer, folderId);
      res.json(result);
    } catch (e: any) {
      console.error("Drive upload error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/google/drive/files", async (_req, res) => {
    try {
      const files = await listDriveFiles();
      res.json(files);
    } catch (e: any) {
      console.error("Drive list error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Google Sheets: Create & Export ──
  app.post("/api/google/sheets/create", async (req, res) => {
    try {
      const { title } = req.body;
      const sheet = await createSpreadsheet(title || "ComicCrafter Export");
      res.json(sheet);
    } catch (e: any) {
      console.error("Sheets create error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/google/sheets/export", async (req, res) => {
    try {
      const { spreadsheetId, sheetName, data } = req.body;
      if (!spreadsheetId || !data) return res.status(400).json({ error: "spreadsheetId and data required" });
      await exportDataToSheet(spreadsheetId, sheetName || "Sheet1", data);
      res.json({ ok: true });
    } catch (e: any) {
      console.error("Sheets export error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/google/sheets/read", async (req, res) => {
    try {
      const { spreadsheetId, range } = req.query;
      if (!spreadsheetId) return res.status(400).json({ error: "spreadsheetId required" });
      const data = await readSheet(spreadsheetId as string, (range as string) || "Sheet1!A1:Z100");
      res.json(data);
    } catch (e: any) {
      console.error("Sheets read error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Admin: Subscription Plans CRUD ──
  app.get("/api/admin/plans", async (_req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/plans", async (req, res) => {
    try {
      const parsed = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(parsed);
      res.json(plan);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.updateSubscriptionPlan(id, req.body);
      if (!plan) return res.status(404).json({ error: "Plan not found" });
      res.json(plan);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/plans/:id", async (req, res) => {
    try {
      await storage.deleteSubscriptionPlan(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── AI Economist: Market Analysis & Plan Recommendations ──
  app.post("/api/ai/economist", async (req, res) => {
    try {
      const { currentPlans, question } = req.body;

      const systemPrompt = `Eres un Super IA Agent Economist Social Market Vending Services para ComicCrafter IA Stories. 
Tu especialidad es analizar el mercado real de plataformas SaaS de creación de contenido con IA (como Midjourney, RunwayML, ElevenLabs, Canva Pro, Adobe Creative Cloud, Leonardo.ai, Jasper AI).

Tus funciones:
1. Recomendar precios competitivos basados en el mercado real actual
2. Sugerir estructuras de planes (Free/Pro/VIP/Enterprise) con sus límites
3. Analizar la competencia y posicionar ComicCrafter estratégicamente
4. Calcular puntos de equilibrio y márgenes
5. Recomendar estrategias de monetización (freemium, trials, bundles)
6. Aconsejar sobre Shopify integration para e-commerce

Datos del mercado actual (2025-2026):
- Midjourney: $10-60/mes (generación de imágenes IA)
- RunwayML: $12-76/mes (vídeo IA)
- ElevenLabs: $5-99/mes (voces IA)
- Canva Pro: $12.99/mes (diseño gráfico)
- Adobe CC: $54.99/mes (suite completa)
- Leonardo.ai: $12-48/mes (arte IA)
- ComicCrafter ofrece: comics IA, guiones, personajes, modelos 3D, voces, vídeos - todo en uno

Responde siempre en español con datos concretos: precios exactos, porcentajes, comparativas. Sé directo y profesional.`;

      const userPrompt = question || `Analiza mis planes actuales y recomienda mejoras:
${JSON.stringify(currentPlans || [], null, 2)}

Dame recomendaciones de:
1. Precios óptimos para cada plan
2. Qué servicios incluir en cada nivel
3. Cómo posicionarnos vs competencia
4. Estrategia de conversión free→pro→vip`;

      let response: string;
      try {
        response = await manusChat(userPrompt, systemPrompt, "gpt-4o");
      } catch {
        response = await geminiChat(userPrompt, systemPrompt);
      }
      res.json({ analysis: response });
    } catch (e: any) {
      console.error("AI Economist error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Gmail: Send Email ──
  app.post("/api/google/mail/send", async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      if (!to || !subject || !body) return res.status(400).json({ error: "to, subject and body required" });
      const result = await sendEmail(to, subject, body);
      res.json(result);
    } catch (e: any) {
      console.error("Gmail send error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Seed default service limits if empty ──
  try {
    const existing = await storage.getAllServiceLimits();
    if (existing.length === 0) {
      const defaults = [
        { planName: "free", serviceName: "images", maxQuantity: 5, enabled: true },
        { planName: "free", serviceName: "scripts", maxQuantity: 3, enabled: true },
        { planName: "free", serviceName: "3d_models", maxQuantity: 1, enabled: true },
        { planName: "free", serviceName: "voices", maxQuantity: 2, enabled: true },
        { planName: "free", serviceName: "videos", maxQuantity: 1, enabled: true },
        { planName: "pro", serviceName: "images", maxQuantity: 50, enabled: true },
        { planName: "pro", serviceName: "scripts", maxQuantity: 30, enabled: true },
        { planName: "pro", serviceName: "3d_models", maxQuantity: 10, enabled: true },
        { planName: "pro", serviceName: "voices", maxQuantity: 20, enabled: true },
        { planName: "pro", serviceName: "videos", maxQuantity: 10, enabled: true },
        { planName: "vip", serviceName: "images", maxQuantity: 999, enabled: true },
        { planName: "vip", serviceName: "scripts", maxQuantity: 999, enabled: true },
        { planName: "vip", serviceName: "3d_models", maxQuantity: 999, enabled: true },
        { planName: "vip", serviceName: "voices", maxQuantity: 999, enabled: true },
        { planName: "vip", serviceName: "videos", maxQuantity: 999, enabled: true },
      ];
      for (const d of defaults) {
        await storage.createServiceLimit(d);
      }
      console.log("[SEED] Default service limits created");
    }
  } catch (e) {
    console.error("Failed to seed service limits:", e);
  }

  return httpServer;
}
