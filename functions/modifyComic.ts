import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { comic_id, comments } = body;

    if (!comic_id || !comments) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const comic = await base44.entities.ComicProject.get(comic_id);

    if (!comic) {
      return Response.json({ error: "Comic not found" }, { status: 404 });
    }

    // Interpretar comentarios
    const modificationPrompt = await base44.integrations.Core.InvokeLLM({
      prompt: `El usuario quiere modificar su cómic "${comic.title}" con estos comentarios: "${comments}"

Historia: ${comic.story}
Estilo: ${comic.style}
Páginas: ${comic.page_count}

Analiza qué páginas o viñetas necesitan cambios.
Devuelve: {"affected_pages": [1, 2...], "suggestions": "..."}`,
      response_json_schema: {
        type: "object",
        properties: {
          affected_pages: {
            type: "array",
            items: { type: "number" },
          },
          suggestions: { type: "string" },
        },
      },
    });

    // En producción, regenerarías las páginas afectadas
    await base44.entities.ComicProject.update(comic_id, {
      generated_pages: comic.generated_pages,
    });

    return Response.json({
      success: true,
      updated_comic: await base44.entities.ComicProject.get(comic_id),
      affected_pages: modificationPrompt.affected_pages,
    });
  } catch (error) {
    console.error("Error modifying comic:", error);
    return Response.json(
      { error: error.message || "Error modifying comic" },
      { status: 500 }
    );
  }
});