import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      gender,
      character_photos,
      questionnaire_responses,
      style = "realistic",
    } = body;

    // Validar entrada
    if (!name || !description || !character_photos?.length || !questionnaire_responses) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generar referencia visual inicial de IA
    const baselineImagePrompt = `Generic 3D character model, neutral pose, front view, basic structure, professional 3D render, clean background, high quality`;
    
    const baselineImage = await base44.integrations.Core.GenerateImage({
      prompt: baselineImagePrompt,
    });

    // Construir prompt ultra-detallado para generación 3D
    const aiPromptEnhancer = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un experto en generación 3D. Crea un prompt ultra-profesional para una API de generación 3D:

PERSONAJE: ${name}
DESCRIPCIÓN BASE: ${description}
GÉNERO: ${gender}
ESTILO: ${style}

RESPUESTAS DETALLADAS DEL USUARIO:
${Object.entries(questionnaire_responses)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

GENERA UN PROMPT QUE INCLUYA:
1. Descripción física precisa (edad aparente, complexión, altura)
2. Rasgos faciales detallados (ojos, nariz, boca, forma de cara)
3. Pelo (estilo, color, textura, largo)
4. Ropa y accesorios específicos
5. Postura y lenguaje corporal
6. Estilo artístico y calidad de renderizado 3D

FORMATO: Devuelve SOLO el prompt optimizado en una línea, sin explicaciones adicionales. Ultra detallado, profesional, técnico para máxima precisión.`,
    });

    // Generar imagen de referencia mejorada
    const enhancedReferenceImage = await base44.integrations.Core.GenerateImage({
      prompt: aiPromptEnhancer,
      existing_image_urls: character_photos,
    });

    // Crear prompt final fusionando toda la información
    const finalPrompt = `${aiPromptEnhancer}. Reference: Base human 3D model with distinctive features from photos. Ultra high quality 3D character model, professional 3D render, perfect anatomy, clean topology, 8K resolution, studio lighting, transparent background.`;

    // Guardar modelo en base de datos
    const model3D = await base44.entities.Model3D.create({
      name,
      description,
      gender,
      character_photos,
      questionnaire_responses,
      style,
      gltf_url: enhancedReferenceImage.url, // En producción: URL real de Meshy/similar
      preview_image: enhancedReferenceImage.url,
      ai_prompt: finalPrompt,
      generation_status: "completed",
      version: 1,
      modification_history: [
        {
          timestamp: new Date().toISOString(),
          modification: "Initial generation from questionnaire",
        },
      ],
    });

    return Response.json({
      success: true,
      id: model3D.id,
      name: model3D.name,
      gltf_url: model3D.gltf_url,
      preview_image: model3D.preview_image,
      gender: model3D.gender,
      style: model3D.style,
      version: model3D.version,
    });
  } catch (error) {
    console.error("Error generating 3D model:", error);
    return Response.json(
      { error: error.message || "Error generating model" },
      { status: 500 }
    );
  }
});