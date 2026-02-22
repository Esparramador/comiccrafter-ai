import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Initializes founder profile on first login
 * Set FOUNDER_EMAIL in environment variables
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const FOUNDER_EMAIL = Deno.env.get('FOUNDER_EMAIL') || '';

    // Check if user profile exists
    const existing = await base44.entities.UserProfile.filter({
      email: user.email
    });

    if (existing.length > 0) {
      // Update last login
      await base44.entities.UserProfile.update(existing[0].id, {
        last_login: new Date().toISOString()
      });
      return Response.json({
        success: true,
        profile: existing[0],
        is_founder: user.email === FOUNDER_EMAIL
      });
    }

    // Create new profile
    const isFounder = user.email === FOUNDER_EMAIL;

    const profile = await base44.entities.UserProfile.create({
      email: user.email,
      is_founder: isFounder,
      role: isFounder ? 'admin' : 'user',
      auth_provider: 'google',
      unlimited_access: isFounder,
      last_login: new Date().toISOString()
    });

    return Response.json({
      success: true,
      profile,
      is_founder: isFounder,
      message: isFounder ? 'Bienvenido Fundador' : 'Perfil creado exitosamente'
    });
  } catch (error) {
    console.error('initializeFounder error:', error);
    return Response.json(
      { error: 'Failed to initialize profile', details: error.message },
      { status: 500 }
    );
  }
});