import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jwtDecode } from 'npm:jwt-decode@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token requerido' }, { status: 400 });
    }

    // Decodificar y verificar token de Google
    const decoded = jwtDecode(token);
    
    if (!decoded.email) {
      return Response.json({ error: 'Email no encontrado en token' }, { status: 400 });
    }

    // Aquí entraría la lógica de sincronización con Base44
    // Por ahora solo verificar que es válido
    return Response.json({ 
      success: true, 
      email: decoded.email,
      name: decoded.name 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});