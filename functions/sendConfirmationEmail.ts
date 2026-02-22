import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sends confirmation email to new users
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_name = user.full_name } = await req.json().catch(() => ({}));

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a ComicCrafter!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Hola <strong>${user_name || 'Creativo'}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Tu cuenta ha sido creada exitosamente. Ahora puedes:
          </p>
          
          <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
            <li>✨ Crear cómics y vídeos animados con IA</li>
            <li>🎨 Acceder a nuestra librería de personajes y voces profesionales</li>
            <li>🎬 Guardar y editar tus proyectos en la nube</li>
            <li>💳 Gestionar tu suscripción y compras</li>
          </ul>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Tu información está segura y encriptada. Todos tus datos de compra y proyectos se guardarán automáticamente.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #8b5cf6;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Email registrado:</strong> ${user.email}
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Si no creaste esta cuenta o tienes preguntas, contacta con nuestro soporte.
            <br><br>
            ¡Comienza a crear increíbles historias hoy!
            <br>
            <strong>El equipo de ComicCrafter</strong>
          </p>
        </div>
      </div>
    `;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '¡Bienvenido a ComicCrafter! Tu cuenta está lista',
      body: emailContent
    });

    return Response.json({ success: true, sent_to: user.email });
  } catch (error) {
    console.error('sendConfirmationEmail error:', error);
    return Response.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
});