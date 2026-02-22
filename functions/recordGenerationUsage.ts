import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const VALID_TYPES = ['video', 'comic'];
const MAX_RETRIES = 3;
const RETRY_DELAY = 100;

/**
 * Validates input and user authorization
 */
async function validateAndAuthorize(base44, type) {
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid type: ${type}`);
  }

  const user = await base44.auth.me();
  if (!user?.email) {
    throw new Error('User not authenticated');
  }

  return user;
}

/**
 * Attempts to update subscription with retry logic
 */
async function updateSubscriptionWithRetry(base44, subscriptionId, updates, retries = 0) {
  try {
    return await base44.entities.UserSubscription.update(subscriptionId, updates);
  } catch (error) {
    if (retries < MAX_RETRIES && error.status === 409) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
      return updateSubscriptionWithRetry(base44, subscriptionId, updates, retries + 1);
    }
    throw error;
  }
}

/**
 * Records usage for a specific generation type
 */
async function recordUsage(base44, subscription, type) {
  const updates = {};
  
  if (type === 'video') {
    updates.video_generations_used = (subscription.video_generations_used || 0) + 1;
  } else {
    updates.comic_generations_used = (subscription.comic_generations_used || 0) + 1;
  }

  return updateSubscriptionWithRetry(base44, subscription.id, updates);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { type } = body;

    // Validate and authorize
    const user = await validateAndAuthorize(base44, type);

    // Get active subscription
    const subscriptions = await base44.entities.UserSubscription.filter({
      user_email: user.email,
      status: "active"
    });

    if (!subscriptions.length) {
      return Response.json(
        { error: 'No active subscription found' },
        { status: 403 }
      );
    }

    const subscription = subscriptions[0];

    // Verify subscription validity
    const renewalDate = new Date(subscription.renewal_date);
    if (new Date() > renewalDate) {
      await base44.entities.UserSubscription.update(subscription.id, {
        status: "expired"
      });
      return Response.json(
        { error: 'Subscription has expired' },
        { status: 403 }
      );
    }

    // Record usage with retry
    await recordUsage(base44, subscription, type);

    return Response.json({
      success: true,
      type,
      recorded_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('recordGenerationUsage error:', error);
    return Response.json(
      {
        error: 'Failed to record usage',
        details: error.message
      },
      { status: 500 }
    );
  }
});