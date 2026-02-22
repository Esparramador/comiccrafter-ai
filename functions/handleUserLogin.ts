import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, full_name, profile_image } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email requerido' }, { status: 400 });
    }

    // Verificar si el usuario existe
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    
    if (existingUsers.length > 0) {
      // Usuario existe - retornar datos
      return Response.json({
        success: true,
        user: existingUsers[0],
        isNewUser: false
      });
    }

    // Usuario no existe - crear nuevo (Auto-register)
    const newUser = await base44.asServiceRole.entities.User.create({
      email,
      full_name: full_name || email.split('@')[0],
      role: 'user'
    });

    // Si tiene foto de perfil, actualizar
    if (profile_image) {
      await base44.auth.updateMe({ profile_image });
    }

    return Response.json({
      success: true,
      user: newUser,
      isNewUser: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});