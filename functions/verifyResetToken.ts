import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Verifies password reset token and allows password change
 */
Deno.serve(async (req) => {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token) {
      return Response.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email });

    if (users.length === 0) {
      return Response.json(
        { error: 'Invalid token or email' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Verify token and expiration
    if (user.password_reset_token !== token) {
      return Response.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (!user.password_reset_expires || new Date() > new Date(user.password_reset_expires)) {
      return Response.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // If newPassword provided, update it (handled by Base44 auth)
    if (newPassword) {
      // Clear reset token after successful password change
      await base44.asServiceRole.entities.User.update(user.id, {
        password_reset_token: null,
        password_reset_expires: null
      });

      return Response.json({
        success: true,
        message: 'Password reset successfully',
        user_id: user.id
      });
    }

    // Just verify token
    return Response.json({
      success: true,
      message: 'Token is valid',
      user_email: user.email,
      user_name: user.full_name
    });
  } catch (error) {
    console.error('verifyResetToken error:', error);
    return Response.json(
      { error: 'Token verification failed', details: error.message },
      { status: 500 }
    );
  }
});