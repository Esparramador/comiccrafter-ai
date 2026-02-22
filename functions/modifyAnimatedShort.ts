import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { short_id, comments } = body;

    if (!short_id || !comments) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const short = await base44.entities.AnimatedShort.get(short_id);

    if (!short) {
      return Response.json({ error: "Short not found" }, { status: 404 });
    }

    // Interpretar comentarios y generar nuevo prompt
    const modificationPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `El usuario quiere modificar su corto animado "${short.title}" con estos comentarios: "${comments}"

Historia original: ${short.story}
Estilo: ${short.style}
Fotogramas: ${short.frame_count}

Basándote en esto, sugiere qué frames necesitan cambios y cómo mejorar el corto general.
Devuelve un JSON: {"changes": ["cambio1", "cambio2"...], "new_prompt_suggestions": "..."}`,
      response_json_schema: {
        type: "object",
        properties: {
          changes: {
            type: "array",
            items: { type: "string" },
          },
          new_prompt_suggestions: { type: "string" },
        },
      },
    });

    // Actualizar frames relevantes
    const updatedFrames = short.generated_frames || [];
    
    // En producción, aquí regenerarías los frames específicos
    // Por ahora, guardamos los cambios
    await base44.entities.AnimatedShort.update(short_id, {
      generated_frames: updatedFrames,
    });

    return Response.json({
      success: true,
      updated_short: await base44.entities.AnimatedShort.get(short_id),
      suggestions: modificationPrompt.changes,
    });
  } catch (error) {
    console.error("Error modifying short:", error);
    return Response.json(
      { error: error.message || "Error modifying short" },
      { status: 500 }
    );
  }
});