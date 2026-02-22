import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'sadiagiljoan@gmail.com') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get app usage statistics
    const videoProjects = await base44.asServiceRole.entities.VideoProject.list();
    const comicProjects = await base44.asServiceRole.entities.ComicProject.list();
    const subscriptions = await base44.asServiceRole.entities.UserSubscription.list();
    const users = await base44.asServiceRole.entities.User.list();

    const stats = {
      totalUsers: users.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      totalVideoProjects: videoProjects.length,
      totalComicProjects: comicProjects.length,
      completedVideos: videoProjects.filter(v => v.status === 'completed').length,
      completedComics: comicProjects.filter(c => c.status === 'completed').length,
    };

    const prompt = `Eres un experto en monetización de aplicaciones AI y SaaS. Analiza estos datos de uso de mi app de generación de contenido con IA:

📊 ESTADÍSTICAS ACTUALES:
- Total de usuarios: ${stats.totalUsers}
- Suscripciones activas: ${stats.activeSubscriptions}
- Proyectos de video generados: ${stats.totalVideoProjects} (${stats.completedVideos} completados)
- Proyectos de cómics generados: ${stats.totalComicProjects} (${stats.completedComics} completados)
- Tasa de conversión: ${stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%

Mi app permite generar:
✨ Cómics con IA
🎬 Videos animados con personajes 3D
🎨 Portadas de libros
🗣️ Voces personalizadas

Proporciona un análisis estratégico profundo incluyendo:

1. **OPORTUNIDADES DE MONETIZACIÓN NO EXPLOTADAS** - Identifica 5 modelos de ingresos nuevos que podrían implementarse
2. **OPTIMIZACIÓN DE PRECIOS** - Analiza la estructura de precios actual y sugiere ajustes para maximizar ARR
3. **FEATURES PREMIUM A PRIORIZAR** - Qué funcionalidades agregar primero para aumentar conversión
4. **ESTRATEGIA DE RETENCIÓN** - Cómo aumentar LTV (lifetime value) de cada usuario
5. **CANALES DE ADQUISICIÓN** - Cómo crecer de ${stats.totalUsers} a 10k usuarios rentablemente
6. **PARTNERSHIPS ESTRATÉGICOS** - Con qué plataformas/servicios asociarse para monetizar más
7. **ANÁLISIS COMPETITIVO** - Posicionamiento respecto a Canva, D-ID, Synthesia, etc.
8. **PROYECCIONES FINANCIERAS** - Estimaciones de ingresos con los cambios sugeridos

Estructura la respuesta de forma clara y ejecutable. Sé específico con números y porcentajes.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                potentialIncome: { type: 'string' },
                effort: { type: 'string' },
                timelineMonths: { type: 'number' },
              },
            },
          },
          pricingStrategy: {
            type: 'object',
            properties: {
              currentIssue: { type: 'string' },
              recommendation: { type: 'string' },
              projectedIncrease: { type: 'string' },
            },
          },
          premiumFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          retentionStrategies: {
            type: 'array',
            items: { type: 'string' },
          },
          acquisitionChannels: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                channel: { type: 'string' },
                strategy: { type: 'string' },
                costPerUser: { type: 'string' },
                projectedReach: { type: 'string' },
              },
            },
          },
          partnerships: {
            type: 'array',
            items: { type: 'string' },
          },
          financialProjections: {
            type: 'object',
            properties: {
              year1: { type: 'string' },
              year2: { type: 'string' },
              year3: { type: 'string' },
            },
          },
          actionItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                priority: { type: 'string' },
                estimatedROI: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      stats,
      analysis: analysis.data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});