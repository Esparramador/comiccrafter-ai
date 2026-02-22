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
    if (!name || !description || !character_photos || !questionnaire_responses) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generar prompt mejorado usando IA
    const promptResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un experto en descripción de modelos 3D. 
      
Crea un prompt ultra-detallado y específico para generar un modelo 3D 3D de alta calidad basado en:
- Nombre: ${name}
- Descripción base: ${description}
- Género: ${gender}
- Estilo: ${style}
- Respuestas del cuestionario: ${JSON.stringify(questionnaire_responses)}

El prompt debe incluir:
1. Descripción física detallada (facial features, complexión, altura, etc.)
2. Ropa y accesorios específicos
3. Estilo y atmósfera
4. Calidad y detalles técnicos para renderizado 3D
5. Recomendaciones de iluminación y composición

Devuelve SOLO el prompt optimizado, sin explicaciones adicionales.`,
    });

    // Generar imagen de referencia
    const referenceImage = await base44.integrations.Core.GenerateImage({
      prompt: promptResult,
      existing_image_urls: character_photos,
    });

    // Simular generación de modelo 3D (en producción usarías Meshy AI u otra API)
    // Por ahora, creamos una estructura simulada que será actualizada con la API real
    const mockGltfUrl = referenceImage.url; // En producción: URL del modelo GLTF de Meshy

    // Guardar en la base de datos
    const model3D = await base44.entities.Model3D.create({
      name,
      description,
      gender,
      character_photos,
      questionnaire_responses,
      style,
      gltf_url: mockGltfUrl,
      preview_image: referenceImage.url,
      ai_prompt: promptResult,
      generation_status: "completed",
      version: 1,
      modification_history: [
        {
          timestamp: new Date().toISOString(),
          modification: "Initial generation",
        },
      ],
    });

    return Response.json({
      success: true,
      id: model3D.id,
      gltf_url: mockGltfUrl,
      preview_image: referenceImage.url,
      name,
      description,
      style,
      version: 1,
    });
  } catch (error) {
    console.error("Error generating 3D model:", error);
    return Response.json(
      { error: error.message || "Error generating model" },
      { status: 500 }
    );
  }
});