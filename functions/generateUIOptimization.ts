import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'sadiagiljoan@gmail.com') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { currentDesign } = await req.json();

    const prompt = `Eres un experto en UX/UI y conversion rate optimization. Tu tarea es analizar y mejorar el diseño actual de un panel de administrador para una app de generación de contenido con IA.

DISEÑO ACTUAL:
${currentDesign}

Proporciona optimizaciones específicas:

1. **MEJORAS DE CONVERSIÓN** - Dónde agregar CTAs más fuertes para monetización
2. **REORGANIZACIÓN DE INFORMACIÓN** - Orden óptimo de elementos según importancia
3. **VISUALIZACIONES MEJORADAS** - Gráficos y métricas que deben destacarse
4. **ELEMENTOS FALTANTES** - Qué widgets/paneles agregar para mejor decisión de negocio
5. **FLUJOS DE USUARIO** - Cómo mejorar navegación para ejecutar acciones de monetización
6. **DESIGN TOKENS** - Colores, tipografía y espaciado optimizados para conversión
7. **MICROINTERACCIONES** - Animaciones y feedback que aumenten engagement

Responde con propuestas concretas y código React/Tailwind cuando sea aplicable.`;

    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          conversionImprovements: {
            type: 'array',
            items: { type: 'string' },
          },
          layoutRecommendations: {
            type: 'array',
            items: { type: 'string' },
          },
          visualizations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                metric: { type: 'string' },
              },
            },
          },
          missingWidgets: {
            type: 'array',
            items: { type: 'string' },
          },
          designTokens: {
            type: 'object',
            properties: {
              primaryColor: { type: 'string' },
              accentColor: { type: 'string' },
              typography: { type: 'string' },
              spacing: { type: 'string' },
            },
          },
          estimatedConversionLift: { type: 'string' },
        },
      },
    });

    return Response.json({
      success: true,
      optimization: optimization.data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});