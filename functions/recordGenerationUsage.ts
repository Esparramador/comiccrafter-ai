import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    const subscriptions = await base44.entities.UserSubscription.filter({
      user_email: user.email,
      status: "active"
    });

    if (subscriptions.length === 0) {
      return Response.json({ error: 'No active subscription' }, { status: 403 });
    }

    const subscription = subscriptions[0];

    if (type === 'video') {
      await base44.entities.UserSubscription.update(subscription.id, {
        video_generations_used: subscription.video_generations_used + 1
      });
    } else if (type === 'comic') {
      await base44.entities.UserSubscription.update(subscription.id, {
        comic_generations_used: subscription.comic_generations_used + 1
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});