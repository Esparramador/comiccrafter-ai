import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jwtDecode } from 'npm:jwt-decode@4.0.0';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Token requerido y debe ser string' }, { status: 400 });
    }

    // Decodificar token Google
    const decoded = jwtDecode(token);
    
    // Validar campos requeridos
    if (!decoded.email || !decoded.email_verified) {
      return Response.json({ error: 'Token inválido o email no verificado' }, { status: 401 });
    }

    // Verificar que el token viene de Google
    if (decoded.iss !== 'https://accounts.google.com') {
      return Response.json({ error: 'Token no proveniente de Google' }, { status: 401 });
    }

    return Response.json({ 
      success: true, 
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      picture: decoded.picture,
      sub: decoded.sub
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json({ 
      error: 'Token verification failed',
      details: error.message 
    }, { status: 401 });
  }
});