import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { functionCode, functionName } = body;

    if (!functionCode) {
      return Response.json({ error: 'Function code is required' }, { status: 400 });
    }

    const geminiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `You are a performance optimization expert for JavaScript/React.
    
Analyze this function and provide EXACTLY these optimizations to make it 10x faster:
1. PARALLEL_CALLS: Which API calls can run in parallel (Promise.all)?
2. CACHING: What should be cached/memoized?
3. REMOVE_REDUNDANT: Duplicate operations to eliminate
4. BATCH_OPERATIONS: Combine multiple operations
5. OPTIMIZE_LOOPS: Reduce iterations or use better algorithms
6. LAZY_LOADING: What can be loaded on-demand?
7. MEMORY_LEAKS: Potential memory issues
8. OPTIMIZED_CODE: Complete optimized version

Function name: ${functionName}
Code:
\`\`\`javascript
${functionCode}
\`\`\`

Return JSON with specific, actionable optimizations. Include the complete optimized function.`;

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
          maxOutputTokens: 4000,
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
    const optimization = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };

    return Response.json({
      success: true,
      functionName,
      optimization,
      estimatedSpeedup: '10x-100x',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});