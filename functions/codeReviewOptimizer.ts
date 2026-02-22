import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code, filePath, fileType = 'javascript' } = body;

    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    const geminiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `You are an expert code reviewer and optimizer. Analyze this ${fileType} code and provide:
1. ERRORS: Critical bugs or issues that will break the code
2. WARNINGS: Performance issues, memory leaks, or bad practices
3. OPTIMIZATIONS: Specific code improvements (be concise)
4. PERFORMANCE: How to make it 10x faster (if applicable)
5. ANDROID: Mobile optimization tips if relevant
6. FIXED_CODE: Return corrected version of critical sections only

File: ${filePath}
Code:
\`\`\`${fileType}
${code}
\`\`\`

Respond in JSON format with arrays for each category. Keep suggestions actionable and specific.`;

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
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };

    return Response.json({
      success: true,
      file: filePath,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});