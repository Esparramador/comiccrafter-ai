import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content_type, initial_input, character_count } = body;

    if (!content_type || !initial_input) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const promptMap = {
      comic: `Basándote en esta historia de cómic: "${initial_input}"
        Genera 6 preguntas clave que ayuden a mejorar y detallar la narrativa visual del cómic.
        Las preguntas deben cubrir: atmósfera visual, transiciones, ritmo narrativo, efectos especiales, composición de viñetas y estilo de diálogo.`,
      
      short: `Basándote en esta historia de corto animado: "${initial_input}"
        Genera 6 preguntas clave para mejorar los detalles de la animación.
        Las preguntas deben cubrir: tipo de animación, ritmo de fotogramas, movimientos de cámara, música y ambientación.`,
      
      cover: `Basándote en esta descripción de portada: "${initial_input}"
        Genera 5 preguntas clave para perfeccionar el diseño visual.
        Las preguntas deben cubrir: composición, paleta de colores, tipografía, elementos visuales y atmósfera.`,
      
      video: `Basándote en este guion de vídeo: "${initial_input}"
        Genera 7 preguntas clave para mejorar la producción de vídeo.
        Las preguntas deben cubrir: planos de cámara, iluminación, efectos especiales, música, transiciones, pacing y efectos de sonido.`,
    };

    const prompt = promptMap[content_type] || promptMap.comic;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${prompt}

        Devuelve un JSON con esta estructura exacta:
        {
          "questions": [
            {"id": 1, "question": "...", "suggestions": ["opción1", "opción2", "opción3"], "category": "..."},
            ...
          ]
        }`,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                question: { type: "string" },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                },
                category: { type: "string" },
              },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      questions: result.questions || [],
    });
  } catch (error) {
    console.error("Error generating questionnaire:", error);
    return Response.json(
      { error: error.message || "Error generating questionnaire" },
      { status: 500 }
    );
  }
});