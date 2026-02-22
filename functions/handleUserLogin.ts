import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { email, full_name, profile_image } = await req.json();

    // Validar entrada
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email requerido y debe ser string' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Verificar si el usuario existe
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    
    if (existingUsers && existingUsers.length > 0) {
      return Response.json({
        success: true,
        user: existingUsers[0],
        isNewUser: false
      });
    }

    // Crear nuevo usuario (Upsert pattern)
    const newUser = await base44.asServiceRole.entities.User.create({
      email,
      full_name: full_name && typeof full_name === 'string' 
        ? full_name.trim() 
        : email.split('@')[0],
      role: 'user'
    });

    // Actualizar perfil si se proporciona imagen
    if (profile_image && typeof profile_image === 'string') {
      try {
        await base44.auth.updateMe({ profile_image });
      } catch (err) {
        console.warn('Failed to update profile image:', err.message);
        // No fallar si no se puede actualizar la imagen
      }
    }

    return Response.json({
      success: true,
      user: newUser,
      isNewUser: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ 
      error: 'Login failed',
      details: error.message 
    }, { status: 500 });
  }
});