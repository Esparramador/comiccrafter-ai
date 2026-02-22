import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Initializes user subscription on first use
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a subscription
    const existing = await base44.entities.UserSubscription.filter({
      user_email: user.email,
      status: "active"
    });

    if (existing.length > 0) {
      return Response.json({ 
        success: true, 
        message: 'Subscription already exists',
        subscription: existing[0]
      });
    }

    // Get the default plan (first active plan)
    const plans = await base44.entities.SubscriptionPlan.filter({
      is_active: true
    });

    if (plans.length === 0) {
      // Create a default trial plan if none exists
      const defaultPlan = await base44.asServiceRole.entities.SubscriptionPlan.create({
        name: "Plan Prueba",
        video_generations_per_month: 5,
        comic_generations_per_month: 10,
        max_video_scenes: 10,
        max_comic_pages: 20,
        features: ["AI Video Generation", "AI Comic Generation", "Basic Support"],
        is_active: true
      });
      
      return createSubscription(base44, user.email, defaultPlan.id);
    }

    return createSubscription(base44, user.email, plans[0].id);
  } catch (error) {
    console.error('initializeUserSubscription error:', error);
    return Response.json(
      { error: 'Failed to initialize subscription', details: error.message },
      { status: 500 }
    );
  }
});

async function createSubscription(base44, email, planId) {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const subscription = await base44.asServiceRole.entities.UserSubscription.create({
    user_email: email,
    plan_id: planId,
    shopify_order_id: "trial_" + Date.now(),
    status: "active",
    start_date: today.toISOString().split('T')[0],
    renewal_date: nextMonth.toISOString().split('T')[0],
    reset_date: nextMonth.toISOString().split('T')[0],
    video_generations_used: 0,
    comic_generations_used: 0
  });

  return Response.json({
    success: true,
    message: 'Subscription created successfully',
    subscription
  });
}