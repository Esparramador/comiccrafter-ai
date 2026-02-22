import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { projectType = 'react-capacitor' } = body;

    const geminiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `You are an expert React + Capacitor to Android optimization specialist.
    
Generate a comprehensive Android build optimization checklist for a ${projectType} project.
Include ONLY critical fixes needed:

1. BUILD_ERRORS: Common build failures and fixes
2. PERFORMANCE: Memory optimization for mobile
3. CAPACITOR_CONFIG: Proper capacitor.config.json setup
4. GRADLE_CONFIG: Essential gradle settings (API level, minSdk, etc.)
5. MANIFEST_FIXES: AndroidManifest.xml requirements
6. CODE_CHANGES: Critical code changes for Android compatibility
7. TESTING_STEPS: How to verify build works
8. COMMON_ISSUES: Specific to your project type

Format response as JSON with actionable steps. Be direct and brief.`;

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
          temperature: 0.2,
          maxOutputTokens: 3000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const checklist = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };

    return Response.json({
      success: true,
      projectType,
      checklist,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});