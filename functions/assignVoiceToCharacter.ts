import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { character_id, gender, age_range, personality } = body;

    if (!character_id || !gender) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Buscar voces que coincidan con los criterios
    let voiceQuery = {
      gender: gender,
    };

    if (age_range) {
      voiceQuery.age_range = age_range;
    }

    const matchingVoices = await base44.entities.VoiceProfile.filter(voiceQuery);

    if (matchingVoices.length === 0) {
      // Fallback: buscar cualquier voz del mismo género
      voiceQuery = { gender: gender };
      const fallbackVoices = await base44.entities.VoiceProfile.filter(voiceQuery);
      
      if (fallbackVoices.length === 0) {
        return Response.json(
          { error: "No matching voices found" },
          { status: 404 }
        );
      }

      return Response.json({
        voice_id: fallbackVoices[0].id,
        voice: fallbackVoices[0],
        message: "Voice assigned with fallback",
      });
    }

    // Seleccionar voz basada en personalidad si disponible
    let selectedVoice = matchingVoices[0];
    if (personality) {
      const personalityMatch = matchingVoices.find((v) =>
        v.personality?.toLowerCase().includes(personality.toLowerCase())
      );
      if (personalityMatch) {
        selectedVoice = personalityMatch;
      }
    }

    return Response.json({
      voice_id: selectedVoice.id,
      voice: selectedVoice,
      message: "Voice assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning voice:", error);
    return Response.json(
      { error: error.message || "Error assigning voice" },
      { status: 500 }
    );
  }
});