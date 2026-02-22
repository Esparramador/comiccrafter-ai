import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { model_id, comments } = body;

    if (!model_id || !comments) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Cargar modelo existente
    const model = await base44.entities.Model3D.get(model_id);

    if (!model) {
      return Response.json({ error: "Model not found" }, { status: 404 });
    }

    // Usar IA para interpretar los comentarios y generar nuevo prompt
    const modificationPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un experto en modificación de modelos 3D.

El usuario quiere modificar su modelo 3D existente con estos comentarios: "${comments}"

Modelo actual:
- Nombre: ${model.name}
- Descripción original: ${model.description}
- Prompt anterior: ${model.ai_prompt}

Genera un prompt MEJORADO que incorpore los comentarios del usuario manteniendo la esencia del personaje.
El nuevo prompt debe ser aún más detallado y específico.

Devuelve SOLO el nuevo prompt optimizado.`,
    });

    // Generar nueva imagen de referencia con el prompt modificado
    const newReferenceImage = await base44.integrations.Core.GenerateImage({
      prompt: modificationPrompt,
      existing_image_urls: model.character_photos,
    });

    // Actualizar el modelo
    const newVersion = (model.version || 1) + 1;
    await base44.entities.Model3D.update(model_id, {
      gltf_url: newReferenceImage.url,
      preview_image: newReferenceImage.url,
      ai_prompt: modificationPrompt,
      version: newVersion,
      modification_history: [
        ...(model.modification_history || []),
        {
          timestamp: new Date().toISOString(),
          modification: `User modification: ${comments}`,
        },
      ],
    });

    return Response.json({
      success: true,
      model_id,
      version: newVersion,
      preview_image: newReferenceImage.url,
      message: "Model updated successfully",
    });
  } catch (error) {
    console.error("Error modifying 3D model:", error);
    return Response.json(
      { error: error.message || "Error modifying model" },
      { status: 500 }
    );
  }
});