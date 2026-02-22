import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    // Get user subscription
    const subscriptions = await base44.entities.UserSubscription.filter({
      user_email: user.email,
      status: "active"
    });

    if (subscriptions.length === 0) {
      return Response.json({
        can_use: false,
        reason: "No active subscription",
        remaining: 0
      });
    }

    const subscription = subscriptions[0];
    const plan = await base44.entities.SubscriptionPlan.list().then(plans =>
      plans.find(p => p.id === subscription.plan_id)
    );

    if (!plan) {
      return Response.json({
        can_use: false,
        reason: "Plan not found",
        remaining: 0
      });
    }

    // Check if reset date has passed
    const today = new Date().toISOString().split('T')[0];
    if (subscription.reset_date < today) {
      // Reset counters
      await base44.entities.UserSubscription.update(subscription.id, {
        video_generations_used: 0,
        comic_generations_used: 0,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      subscription.video_generations_used = 0;
      subscription.comic_generations_used = 0;
    }

    let limit, used, field;

    if (type === 'video') {
      limit = plan.video_generations_per_month;
      used = subscription.video_generations_used;
      field = 'video_generations_used';
    } else if (type === 'comic') {
      limit = plan.comic_generations_per_month;
      used = subscription.comic_generations_used;
      field = 'comic_generations_used';
    }

    const can_use = used < limit;
    const remaining = Math.max(0, limit - used);

    return Response.json({
      can_use,
      remaining,
      limit,
      used,
      plan_name: plan.name,
      field
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});