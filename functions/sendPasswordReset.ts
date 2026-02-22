import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sends password reset email
 */
Deno.serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get Base44 SDK
    const base44 = createClientFromRequest(req);

    // Find user (use service role to check all users)
    const users = await base44.asServiceRole.entities.User.filter({ email });

    if (users.length === 0) {
      // Security: don't reveal if user exists
      return Response.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones de recuperación'
      });
    }

    const user = users[0];

    // Generate reset token (simple random token)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // Update user with reset token
    await base44.asServiceRole.entities.User.update(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: expiresAt.toISOString()
    });

    // Send reset email
    const resetLink = `${Deno.env.get('APP_URL') || 'https://comiccrafter.app'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperar contraseña</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            Hola ${user.full_name || 'Creativo'},
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Recibimos una solicitud para recuperar tu contraseña. Si no fuiste tú, ignora este correo.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; padding: 12px 40px; border-radius: 8px; display: inline-block; font-weight: bold;">
              Recuperar contraseña
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Este enlace expira en <strong>1 hora</strong>.
            <br><br>
            Si no puedes hacer clic en el botón, copia este enlace:
            <br>
            <code style="background: #e5e7eb; padding: 5px 10px; border-radius: 4px; word-break: break-all;">
              ${resetLink}
            </code>
          </p>
        </div>
      </div>
    `;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: '🔐 Recuperar tu contraseña en ComicCrafter',
      body: emailContent
    });

    return Response.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones de recuperación'
    });
  } catch (error) {
    console.error('sendPasswordReset error:', error);
    return Response.json(
      { error: 'Failed to send reset email', details: error.message },
      { status: 500 }
    );
  }
});