import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, contentType = 'general', cacheBuster = false } = body;

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const geminiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Generate with Gemini 2.0 Flash (faster than Pro)
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.95,
          topK: 40,
        },
        systemInstruction: {
          parts: [{
            text: 'You are an expert content generator for creative media. Generate high-quality, detailed content that is optimized for AI image/video generation. Be specific and vivid in descriptions. Respond with structured JSON when requested.',
          }],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '';

    // Try to parse JSON response
    let parsedContent = content;
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        parsedContent = JSON.parse(jsonMatch[0]);
      } catch {
        parsedContent = content;
      }
    }

    return Response.json({
      success: true,
      contentType,
      content: parsedContent,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.0-flash',
      cached: !cacheBuster,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});