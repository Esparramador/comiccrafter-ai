import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Retorna la configuración de Google OAuth de forma segura
 * La API key nunca se expone al cliente
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // La API key está segura en variables de entorno del servidor
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    
    if (!clientId) {
      return Response.json({ error: 'Google config not set' }, { status: 500 });
    }

    // Solo retornar el client ID (públicamente conocido)
    // Nunca retornar secrets
    return Response.json({ 
      clientId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Config error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});