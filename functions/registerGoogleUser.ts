import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, user_name, profile_image } = await req.json();

    if (!email) {
      return Response.json({ success: false, error: 'Email requerido' }, { status: 400 });
    }

    // Buscar si el usuario ya existe
    let userProfile = await base44.asServiceRole.entities.UserProfile.filter({
      email: email
    });

    if (!userProfile || userProfile.length === 0) {
      // Crear nuevo usuario
      userProfile = await base44.asServiceRole.entities.UserProfile.create({
        email: email,
        is_founder: false,
        role: 'user',
        auth_provider: 'google',
        profile_image: profile_image || '',
        unlimited_access: false,
        last_login: new Date().toISOString()
      });
    } else {
      // Actualizar último login
      userProfile = userProfile[0];
      await base44.asServiceRole.entities.UserProfile.update(userProfile.id, {
        last_login: new Date().toISOString()
      });
    }

    // Enviar email de bienvenida
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: '¡Bienvenido a ComicCrafter!',
      body: `
        <h1>¡Bienvenido a ComicCrafter, ${user_name || 'amigo'}!</h1>
        <p>Tu cuenta ha sido creada exitosamente con Google.</p>
        <p>Ahora puedes crear cómics, vídeos y arte con IA.</p>
        <p>¡Que disfrutes creando contenido increíble!</p>
      `,
      from_name: 'ComicCrafter'
    });

    return Response.json({ 
      success: true, 
      message: 'Usuario registrado correctamente',
      user: {
        email: userProfile.email,
        profile_image: userProfile.profile_image
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});