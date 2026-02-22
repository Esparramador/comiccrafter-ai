import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 60000; // 60 seconds
const QUALITY_PRESETS = {
  standard: { style: "professional, cinematic", quality: "high quality" },
  premium: { style: "professional, cinematic, award-winning", quality: "ultra-high quality" },
  economy: { style: "clean, clear", quality: "good quality" }
};

/**
 * Validates image generation request
 */
function validateRequest(prompt, quality = 'standard') {
  if (!prompt || prompt.length < 10) {
    throw new Error('Prompt must be at least 10 characters');
  }
  if (prompt.length > 2000) {
    throw new Error('Prompt exceeds maximum length');
  }
  if (!QUALITY_PRESETS[quality]) {
    throw new Error(`Invalid quality preset: ${quality}`);
  }
}

/**
 * Enhances prompt with quality settings
 */
function enhancePrompt(prompt, quality = 'standard') {
  const preset = QUALITY_PRESETS[quality];
  return `${prompt}. ${preset.quality}, ${preset.style}.`;
}

/**
 * Attempts image generation with timeout and retry
 */
async function generateImageWithRetry(base44, enhancedPrompt, existingImages, retries = 0) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const result = await base44.integrations.Core.GenerateImage({
      prompt: enhancedPrompt,
      ...(existingImages?.length > 0 ? { existing_image_urls: existingImages } : {})
    });

    clearTimeout(timeout);
    return result;
  } catch (error) {
    clearTimeout(timeout);
    
    if (retries < MAX_RETRIES && error.status !== 400) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      return generateImageWithRetry(base44, enhancedPrompt, existingImages, retries + 1);
    }
    throw error;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, existing_image_urls = [], quality = 'standard' } = body;

    // Validate request
    validateRequest(prompt, quality);

    // Check generation limits
    const limitCheck = await base44.functions.invoke('checkUserLimits', { type: 'video' });
    if (!limitCheck.data?.can_use) {
      return Response.json({
        error: 'Generation limit exceeded',
        remaining: limitCheck.data?.remaining || 0
      }, { status: 429 });
    }

    // Enhance prompt
    const enhancedPrompt = enhancePrompt(prompt, quality);

    // Generate image with retry logic
    const result = await generateImageWithRetry(base44, enhancedPrompt, existing_image_urls);

    // Record usage
    await base44.functions.invoke('recordGenerationUsage', { type: 'video' });

    return Response.json({
      success: true,
      url: result.url,
      quality,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('enhancedGenerateImage error:', error);
    return Response.json({
      error: 'Image generation failed',
      details: error.message
    }, { status: 500 });
  }
});