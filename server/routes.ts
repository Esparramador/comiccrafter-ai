import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema, insertGeneratedImageSchema, insertScriptSchema, insertAppUserSchema, insertServiceLimitSchema, insertSubscriptionPlanSchema, registerSchema, loginSchema, googleAuthSchema } from "@shared/schema";
import { openai, generateImageBuffer } from "./replit_integrations/image/client";
import { manusGenerateImage, manusGenerateImageBuffer, manusChat, manusBatchImages } from "./manus-ai";
import { createTextTo3D, uploadImageToTripo, createImageTo3D, createMultiviewTo3D, retopologyModel, rigModel, retargetAnimation, textureModel, stylizeModel, convertModel, getTaskStatus, downloadModel, getTripoBalance, TRIPO_ANIMATIONS, TRIPO_STYLES, TRIPO_EXPORT_FORMATS } from "./tripo3d";
import { generateGalleryBatch } from "./generate-gallery";
import { listVoices, textToSpeech, getVoiceById } from "./elevenlabs";
import { geminiChat } from "./gemini";
import { uploadFileToDrive, listDriveFiles } from "./google-drive";
import { createSpreadsheet, exportDataToSheet, readSheet } from "./google-sheets";
import { sendEmail } from "./google-mail";
import * as shopify from "./shopify";
import { registerWithEmail, loginWithEmail, loginWithGoogle, getCurrentUser, extractToken } from "./auth";

const SUPER_USER_EMAIL = "sadiagiljoan@gmail.com";

const CREDIT_COSTS: Record<string, number> = {
  "generate-script": 0,
  "generate-character-text": 0,
  "generate-character-image": 5,
  "generate-cover": 5,
  "generate-comic-page": 5,
  "generate-image": 5,
  "manus-gallery": 15,
  "gallery-batch": 15,
  "generate-3d": 10,
  "generate-3d-from-image": 10,
  "generate-3d-multiview": 35,
  "3d-retopology": 8,
  "3d-rig": 15,
  "3d-animate": 15,
  "3d-texture": 8,
  "3d-stylize": 8,
  "3d-convert": 2,
  "3d-download": 0,
  "generate-voice": 3,
  "generate-video": 8,
  "gemini-chat": 0,
  "gemini-analyze": 0,
  "economist": 0,
};

async function checkAndDeductCredits(req: any, serviceKey: string): Promise<{ ok: boolean; error?: string; user?: any }> {
  const cost = CREDIT_COSTS[serviceKey] ?? 0;
  if (cost === 0) return { ok: true };

  const token = extractToken(req.headers?.authorization);
  if (!token) return { ok: false, error: "No autenticado. Inicia sesión para usar este servicio." };

  const user = await getCurrentUser(token);
  if (!user) return { ok: false, error: "Token inválido. Vuelve a iniciar sesión." };

  if (user.email === SUPER_USER_EMAIL) return { ok: true, user };

  if ((user.credits || 0) < cost) {
    return {
      ok: false,
      error: `Créditos insuficientes. Este servicio cuesta ${cost} créditos. Tu saldo: ${user.credits || 0} créditos. Visita la Tienda para comprar más créditos.`,
    };
  }

  await storage.updateAppUser(user.id, {
    credits: (user.credits || 0) - cost,
    totalGenerations: (user.totalGenerations || 0) + 1,
  } as any);

  return { ok: true, user };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Auth: Register with email/password ──
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const result = await registerWithEmail(email, password, name);

      shopify.syncUserToShopify(email, name).then(shopifyId => {
        if (shopifyId) {
          storage.updateAppUser(result.user.id, { shopifyCustomerId: shopifyId } as any);
        }
      }).catch(() => {});

      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ── Auth: Login with email/password ──
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await loginWithEmail(email, password);
      res.json(result);
    } catch (e: any) {
      res.status(401).json({ error: e.message });
    }
  });

  // ── Auth: Google Sign-In ──
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = googleAuthSchema.parse(req.body);
      const result = await loginWithGoogle(credential);

      if (!result.user.shopifyCustomerId) {
        shopify.syncUserToShopify(result.user.email, result.user.name || "").then(shopifyId => {
          if (shopifyId) {
            storage.updateAppUser(result.user.id, { shopifyCustomerId: shopifyId } as any);
          }
        }).catch(() => {});
      }

      res.json(result);
    } catch (e: any) {
      res.status(401).json({ error: e.message });
    }
  });

  // ── Auth: Delete account ──
  app.delete("/api/auth/delete-account", async (req, res) => {
    try {
      const token = extractToken(req.headers?.authorization);
      if (!token) return res.status(401).json({ error: "No autenticado. Inicia sesión para eliminar tu cuenta." });

      const user = await getCurrentUser(token);
      if (!user) return res.status(401).json({ error: "Token inválido. Vuelve a iniciar sesión." });

      const { confirmEmail } = req.body || {};
      if (!confirmEmail || confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(400).json({ error: "El email de confirmación no coincide con tu cuenta." });
      }

      if (user.email === SUPER_USER_EMAIL) {
        return res.status(403).json({ error: "La cuenta del administrador no puede ser eliminada." });
      }

      await storage.deleteAppUser(user.id);
      console.log(`[DELETE-ACCOUNT] User ${user.email} (ID: ${user.id}) account deleted permanently.`);

      res.json({ success: true, message: "Tu cuenta y todos tus datos han sido eliminados permanentemente." });
    } catch (e: any) {
      console.error("Delete account error:", e);
      res.status(500).json({ error: "Error al eliminar la cuenta. Contacta a soporte si el problema persiste." });
    }
  });

  // ── Auth: Get current user ──
  app.get("/api/auth/me", async (req, res) => {
    try {
      const token = extractToken(req.headers.authorization);
      if (!token) return res.status(401).json({ error: "No autenticado" });
      const user = await getCurrentUser(token);
      if (!user) return res.status(401).json({ error: "Token inválido" });
      res.json({ user });
    } catch (e: any) {
      res.status(401).json({ error: e.message });
    }
  });

  // ── Auth: Update profile ──
  app.put("/api/auth/profile", async (req, res) => {
    try {
      const token = extractToken(req.headers.authorization);
      if (!token) return res.status(401).json({ error: "No autenticado" });
      const currentUser = await getCurrentUser(token);
      if (!currentUser) return res.status(401).json({ error: "Token inválido" });
      const { name, avatarUrl } = req.body;
      const updated = await storage.updateAppUser(currentUser.id, { name, avatarUrl });
      if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });
      const { passwordHash, ...safe } = updated;
      res.json({ user: safe });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ── Credits: Get cost table ──
  app.get("/api/credits/costs", (_req, res) => {
    res.json(CREDIT_COSTS);
  });

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

      const scriptContent = await geminiChat(userPrompt, systemPrompt).catch(() => manusChat(userPrompt, systemPrompt, "gpt-4o"));

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
      const creditCheck = await checkAndDeductCredits(req, "generate-character-image");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-character-image"] });

      const { prompt } = req.body;

      const raw = await geminiChat(
        prompt || "Genera un personaje aleatorio para un cómic cyberpunk",
        `Eres un diseñador de personajes para cómics y manga. Dado un prompt, genera un personaje con los siguientes campos en JSON:
{ "name": "...", "role": "...", "description": "..." }
El nombre debe ser creativo. El rol puede ser: Protagonista, Antagonista, Secundario, Mentor, etc. La descripción debe incluir apariencia física, personalidad y lore (2-3 frases). Responde SOLO con el JSON.`
      ).catch(() => manusChat(
        prompt || "Genera un personaje aleatorio para un cómic cyberpunk",
        `Eres un diseñador de personajes para cómics y manga. Dado un prompt, genera un personaje con los siguientes campos en JSON:
{ "name": "...", "role": "...", "description": "..." }
El nombre debe ser creativo. El rol puede ser: Protagonista, Antagonista, Secundario, Mentor, etc. La descripción debe incluir apariencia física, personalidad y lore (2-3 frases). Responde SOLO con el JSON.`,
        "gpt-4o"
      ));

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
      const creditCheck = await checkAndDeductCredits(req, "generate-cover");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-cover"] });

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
      const creditCheck = await checkAndDeductCredits(req, "generate-comic-page");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-comic-page"] });

      const { script, style, panelCount, language, customPrompt } = req.body;

      const panelNum = panelCount || 5;
      const comicStyle = style || "manga shonen";

      const rawPanels = await geminiChat(
        customPrompt || script || "Genera una página de cómic de acción cyberpunk",
        `Eres un director de arte de manga/cómic. Dada una idea o guion, genera exactamente ${panelNum} descripciones de viñetas para dibujar, junto con los diálogos/textos de cada viñeta. Responde en JSON:
{ "panels": [ { "imagePrompt": "detailed scene description for image generation...", "dialogue": "Character: text...", "sfx": "sound effect if any" } ] }
Responde SOLO con JSON válido.`
      ).catch(() => manusChat(
        customPrompt || script || "Genera una página de cómic de acción cyberpunk",
        `Eres un director de arte de manga/cómic. Dada una idea o guion, genera exactamente ${panelNum} descripciones de viñetas para dibujar, junto con los diálogos/textos de cada viñeta. Responde en JSON:
{ "panels": [ { "imagePrompt": "detailed scene description for image generation...", "dialogue": "Character: text...", "sfx": "sound effect if any" } ] }
Responde SOLO con JSON válido.`,
        "gpt-4o"
      ));
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
      const creditCheck = await checkAndDeductCredits(req, "generate-image");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-image"] });

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
      const creditCheck = await checkAndDeductCredits(req, "manus-gallery");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["manus-gallery"] });

      const { theme, count, style: artStyle } = req.body;
      const numImages = Math.min(count || 5, 10);

      const promptsRaw = await geminiChat(
        `Genera exactamente ${numImages} prompts creativos y detallados para generar imágenes con DALL-E 3 sobre el tema: "${theme || "arte de cómics y manga variado"}". 
Estilo artístico preferido: ${artStyle || "variado (manga, anime, western comics, cyberpunk, fantasía)"}.
Cada prompt debe ser diferente y creativo. Responde SOLO con un JSON array:
["prompt 1", "prompt 2", ...]`,
        "Eres un director de arte experto en cómics, manga y arte digital. Generas prompts extremadamente detallados y creativos para generación de imágenes IA."
      ).catch(() => manusChat(
        `Genera exactamente ${numImages} prompts creativos y detallados para generar imágenes con DALL-E 3 sobre el tema: "${theme || "arte de cómics y manga variado"}". 
Estilo artístico preferido: ${artStyle || "variado (manga, anime, western comics, cyberpunk, fantasía)"}.
Cada prompt debe ser diferente y creativo. Responde SOLO con un JSON array:
["prompt 1", "prompt 2", ...]`,
        "Eres un director de arte experto en cómics, manga y arte digital. Generas prompts extremadamente detallados y creativos para generación de imágenes IA.",
        "gpt-4o"
      ));

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
      const creditCheck = await checkAndDeductCredits(req, "generate-3d");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-3d"] });

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
      const creditCheck = await checkAndDeductCredits(req, "generate-3d-from-image");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-3d-from-image"] });

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

  // ── Tripo3D: Download/Export model ──
  app.get("/api/ai/3d-download/:taskId", async (req, res) => {
    try {
      const result = await downloadModel(req.params.taskId);
      res.json(result);
    } catch (e: any) {
      console.error("3D download error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Retopology ──
  app.post("/api/ai/3d-retopology", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "3d-retopology");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["3d-retopology"] });

      const { taskId, targetFaceCount, topology } = req.body;
      if (!taskId) return res.status(400).json({ error: "Task ID required" });
      const result = await retopologyModel(taskId, { target_face_count: targetFaceCount, topology });
      res.json(result);
    } catch (e: any) {
      console.error("3D retopology error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Auto-Rig ──
  app.post("/api/ai/3d-rig", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "3d-rig");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["3d-rig"] });

      const { taskId } = req.body;
      if (!taskId) return res.status(400).json({ error: "Task ID required" });
      const result = await rigModel(taskId);
      res.json(result);
    } catch (e: any) {
      console.error("3D rig error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Retarget Animation ──
  app.post("/api/ai/3d-animate", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "3d-animate");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["3d-animate"] });

      const { rigTaskId, animation } = req.body;
      if (!rigTaskId || !animation) return res.status(400).json({ error: "Rig task ID and animation required" });
      const result = await retargetAnimation(rigTaskId, animation);
      res.json(result);
    } catch (e: any) {
      console.error("3D animate error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Texture Refinement ──
  app.post("/api/ai/3d-texture", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "3d-texture");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["3d-texture"] });

      const { taskId, textureQuality, textureAlignment } = req.body;
      if (!taskId) return res.status(400).json({ error: "Task ID required" });
      const result = await textureModel(taskId, { texture_quality: textureQuality, texture_alignment: textureAlignment });
      res.json(result);
    } catch (e: any) {
      console.error("3D texture error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Stylization ──
  app.post("/api/ai/3d-stylize", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "3d-stylize");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["3d-stylize"] });

      const { taskId, style } = req.body;
      if (!taskId || !style) return res.status(400).json({ error: "Task ID and style required" });
      const result = await stylizeModel(taskId, style);
      res.json(result);
    } catch (e: any) {
      console.error("3D stylize error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Format Conversion ──
  app.post("/api/ai/3d-convert", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "3d-convert");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["3d-convert"] });

      const { taskId, format, quad, faceLimit, flattenBottom, textureSize, pivotToCenter } = req.body;
      if (!taskId || !format) return res.status(400).json({ error: "Task ID and format required" });
      const result = await convertModel(taskId, format, {
        quad, face_limit: faceLimit, flatten_bottom: flattenBottom,
        texture_size: textureSize, pivot_to_center_bottom: pivotToCenter,
      });
      res.json(result);
    } catch (e: any) {
      console.error("3D convert error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Multiview to 3D ──
  app.post("/api/ai/generate-3d-multiview", async (req, res) => {
    try {
      const creditCheck = await checkAndDeductCredits(req, "generate-3d-multiview");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-3d-multiview"] });

      const { imageTokens } = req.body;
      if (!imageTokens || !imageTokens.length) return res.status(400).json({ error: "Image tokens required" });
      const result = await createMultiviewTo3D(imageTokens);
      res.json(result);
    } catch (e: any) {
      console.error("3D multiview error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Tripo3D: Get animations, styles, formats catalog ──
  app.get("/api/ai/3d-catalog", (_req, res) => {
    res.json({
      animations: TRIPO_ANIMATIONS,
      styles: TRIPO_STYLES,
      formats: TRIPO_EXPORT_FORMATS,
    });
  });

  // ── Tripo3D: Get Tripo balance ──
  app.get("/api/ai/3d-balance", async (_req, res) => {
    try {
      const balance = await getTripoBalance();
      res.json(balance);
    } catch (e: any) {
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
      const creditCheck = await checkAndDeductCredits(req, "generate-voice");
      if (!creditCheck.ok) return res.status(402).json({ error: creditCheck.error, creditRequired: CREDIT_COSTS["generate-voice"] });

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
        response = await geminiChat(userPrompt, systemPrompt);
      } catch {
        response = await manusChat(userPrompt, systemPrompt, "gpt-4o");
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

  // ── Shopify Integration ──
  app.get("/api/shopify/status", async (_req, res) => {
    res.json({ connected: shopify.isConfigured() });
  });

  app.get("/api/shopify/shop", async (_req, res) => {
    try {
      const shop = await shopify.getShopInfo();
      res.json(shop);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopify/products", async (_req, res) => {
    try {
      const products = await shopify.getProducts();
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopify/products/:id", async (req, res) => {
    try {
      const product = await shopify.getProduct(Number(req.params.id));
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/shopify/products", async (req, res) => {
    try {
      const product = await shopify.createProduct(req.body);
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/shopify/products/:id", async (req, res) => {
    try {
      const product = await shopify.updateProduct(Number(req.params.id), req.body);
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/shopify/products/:id", async (req, res) => {
    try {
      await shopify.deleteProduct(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopify/orders", async (_req, res) => {
    try {
      const orders = await shopify.getOrders();
      res.json(orders);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopify/orders/:id", async (req, res) => {
    try {
      const order = await shopify.getOrder(Number(req.params.id));
      res.json(order);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopify/customers", async (_req, res) => {
    try {
      const customers = await shopify.getCustomers();
      res.json(customers);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopify/collections", async (_req, res) => {
    try {
      const collections = await shopify.getCollections();
      res.json(collections);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/shopify/draft-orders", async (req, res) => {
    try {
      const draftOrder = await shopify.createDraftOrder(req.body);
      res.json(draftOrder);
    } catch (e: any) {
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

  // ── Admin: Deploy Shopify Theme (superuser only) ──
  app.post("/api/admin/deploy-shopify-theme", async (req, res) => {
    try {
      const token = extractToken(req.headers?.authorization);
      if (!token) return res.status(401).json({ error: "No autenticado" });
      const user = await getCurrentUser(token);
      if (!user || user.email !== SUPER_USER_EMAIL) return res.status(403).json({ error: "Solo el superusuario puede desplegar temas" });

      const SHOPIFY_STORE = "comic-crafter.myshopify.com";
      const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
      if (!SHOPIFY_TOKEN) return res.status(500).json({ error: "SHOPIFY_ACCESS_TOKEN no configurado" });

      const API_VERSION = "2024-01";
      const shopifyApi = async (endpoint: string, method = "GET", body?: any) => {
        const url = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}${endpoint}`;
        const r = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": SHOPIFY_TOKEN },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        if (!r.ok) throw new Error(`Shopify ${r.status}: ${await r.text()}`);
        return r.json();
      };

      const fs = await import("fs");
      const path = await import("path");
      const themeDir = path.resolve(process.cwd(), "shopify-theme");

      const themesData = await shopifyApi("/themes.json");
      let themeId: number;
      const existing = themesData.themes.find((t: any) => t.name === "Comic Crafter Pro");
      if (existing) {
        themeId = existing.id;
      } else {
        const created = await shopifyApi("/themes.json", "POST", { theme: { name: "Comic Crafter Pro", role: "main" } });
        themeId = created.theme.id;
      }

      const files: { key: string; value?: string; attachment?: string }[] = [];
      const dirs = ["layout", "templates", "sections", "snippets", "config", "locales"];
      for (const dir of dirs) {
        const dirPath = path.join(themeDir, dir);
        if (!fs.existsSync(dirPath)) continue;
        const walk = (base: string, prefix: string) => {
          for (const entry of fs.readdirSync(base)) {
            const full = path.join(base, entry);
            if (fs.statSync(full).isDirectory()) {
              walk(full, `${prefix}${entry}/`);
            } else {
              files.push({ key: `${prefix}${entry}`, value: fs.readFileSync(full, "utf-8") });
            }
          }
        };
        walk(dirPath, `${dir}/`);
      }

      const assetsDir = path.join(themeDir, "assets");
      if (fs.existsSync(assetsDir)) {
        for (const file of fs.readdirSync(assetsDir)) {
          const full = path.join(assetsDir, file);
          if (!fs.statSync(full).isFile()) continue;
          const ext = path.extname(file).toLowerCase();
          if ([".css", ".js", ".json", ".svg", ".liquid"].includes(ext)) {
            files.push({ key: `assets/${file}`, value: fs.readFileSync(full, "utf-8") });
          } else {
            files.push({ key: `assets/${file}`, attachment: fs.readFileSync(full).toString("base64") });
          }
        }
      }

      const results: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        try {
          const body: any = { asset: { key: f.key } };
          if (f.value !== undefined) body.asset.value = f.value;
          if (f.attachment !== undefined) body.asset.attachment = f.attachment;
          await shopifyApi(`/themes/${themeId}/assets.json`, "PUT", body);
          results.push(`✓ ${f.key}`);
        } catch (err: any) {
          results.push(`✗ ${f.key}: ${err.message.substring(0, 80)}`);
        }
        if ((i + 1) % 2 === 0) await new Promise(r => setTimeout(r, 500));
      }

      res.json({ success: true, themeId, filesUploaded: results.filter(r => r.startsWith("✓")).length, totalFiles: files.length, details: results });
    } catch (e: any) {
      console.error("Shopify deploy error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Download Shopify Theme as ZIP ──
  app.get("/api/admin/download-shopify-theme", async (req, res) => {
    try {
      const token = extractToken(req.headers?.authorization);
      if (!token) return res.status(401).json({ error: "No autenticado" });
      const user = await getCurrentUser(token);
      if (!user || user.email !== SUPER_USER_EMAIL) return res.status(403).json({ error: "Solo superusuario" });

      const fs = await import("fs");
      const path = await import("path");
      const archiver = (await import("archiver")).default;
      const themeDir = path.resolve(process.cwd(), "shopify-theme");

      if (!fs.existsSync(themeDir)) return res.status(404).json({ error: "Theme directory not found" });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=comic-crafter-theme.zip");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);
      archive.directory(themeDir, false);
      await archive.finalize();
    } catch (e: any) {
      console.error("Theme download error:", e);
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  });

  // ── ZIP Export (behind paywall) ──
  app.post("/api/export/zip", async (req, res) => {
    try {
      const token = extractToken(req.headers?.authorization);
      if (!token) return res.status(401).json({ error: "Not authenticated" });
      const user = await getCurrentUser(token);
      if (!user) return res.status(401).json({ error: "Invalid token" });

      const isSuperuser = user.email === SUPER_USER_EMAIL;
      const canExport = isSuperuser || user.plan === "pro" || user.plan === "vip";
      if (!canExport) {
        return res.status(403).json({ error: "ZIP export requires a Pro or VIP plan. Upgrade in the store." });
      }

      const { type, ids } = req.body as { type?: string; ids?: number[] };
      const archiver = (await import("archiver")).default;
      const archive = archiver("zip", { zlib: { level: 5 } });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="comiccrafter-export-${Date.now()}.zip"`);
      archive.pipe(res);

      const fetchAndAppend = async (url: string, filename: string) => {
        try {
          if (url.startsWith("data:")) {
            const match = url.match(/^data:[^;]+;base64,(.+)$/);
            if (match) {
              archive.append(Buffer.from(match[1], "base64"), { name: filename });
            }
          } else {
            const resp = await fetch(url);
            if (resp.ok) {
              const buf = Buffer.from(await resp.arrayBuffer());
              archive.append(buf, { name: filename });
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${filename}:`, e);
        }
      };

      if (!type || type === "images" || type === "all") {
        const images = await storage.getAllImages();
        const filtered = ids && type === "images" ? images.filter(i => ids.includes(i.id)) : images;
        for (const img of filtered) {
          const ext = img.imageUrl.startsWith("data:image/png") ? "png" : "png";
          await fetchAndAppend(img.imageUrl, `images/${img.category}-${img.id}.${ext}`);
        }
      }

      if (!type || type === "characters" || type === "all") {
        const characters = await storage.getAllCharacters();
        const filtered = ids && type === "characters" ? characters.filter(c => ids.includes(c.id)) : characters;
        for (const char of filtered) {
          const info = `Name: ${char.name}\nRole: ${char.role}\nDescription: ${char.description}\nVoice: ${char.voice}\nHas 3D: ${char.has3D}\n`;
          archive.append(Buffer.from(info, "utf-8"), { name: `characters/${char.name.replace(/[^a-zA-Z0-9]/g, "_")}/info.txt` });
          if (char.photoUrls) {
            for (let i = 0; i < char.photoUrls.length; i++) {
              await fetchAndAppend(char.photoUrls[i], `characters/${char.name.replace(/[^a-zA-Z0-9]/g, "_")}/photo_${i + 1}.png`);
            }
          }
        }
      }

      if (!type || type === "scripts" || type === "all") {
        const scripts = await storage.getAllScripts();
        for (const s of scripts) {
          archive.append(Buffer.from(s.content, "utf-8"), { name: `scripts/${s.title.replace(/[^a-zA-Z0-9]/g, "_")}_${s.id}.txt` });
        }
      }

      await archive.finalize();
    } catch (e: any) {
      console.error("ZIP export error:", e);
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  });

  return httpServer;
}
