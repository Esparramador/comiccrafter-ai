import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const VALID_TYPES = ['video', 'comic'];
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Validates input parameters
 */
function validateInput(type) {
  if (!type || !VALID_TYPES.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }
}

/**
 * Resets monthly counters if needed
 */
async function handleMonthlyReset(subscription) {
  const today = new Date();
  const resetDate = new Date(subscription.reset_date);
  
  if (today >= resetDate) {
    const nextResetDate = new Date(today);
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    
    return {
      video_generations_used: 0,
      comic_generations_used: 0,
      reset_date: nextResetDate.toISOString().split('T')[0]
    };
  }
  return null;
}

/**
 * Gets limit and usage for specified type
 */
function getLimitData(type, plan, subscription) {
  const limits = {
    video: {
      limit: plan.video_generations_per_month,
      used: subscription.video_generations_used,
      field: 'video_generations_used'
    },
    comic: {
      limit: plan.comic_generations_per_month,
      used: subscription.comic_generations_used,
      field: 'comic_generations_used'
    }
  };
  return limits[type];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();
    validateInput(type);

    // Check cache
    const cacheKey = `${user.email}:${type}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Response.json(cached.data);
    }

    // Get active subscription
    const subscriptions = await base44.entities.UserSubscription.filter({
      user_email: user.email,
      status: "active"
    });

    if (!subscriptions.length) {
      return Response.json({
        can_use: false,
        reason: "No active subscription",
        remaining: 0,
        limit: 0,
        used: 0
      }, { status: 403 });
    }

    let subscription = subscriptions[0];

    // Get plan
    const plans = await base44.entities.SubscriptionPlan.list();
    const plan = plans.find(p => p.id === subscription.plan_id);

    if (!plan) {
      return Response.json({
        error: 'Plan configuration error',
        reason: 'Plan not found'
      }, { status: 500 });
    }

    // Handle monthly reset
    const resetData = await handleMonthlyReset(subscription);
    if (resetData) {
      await base44.entities.UserSubscription.update(subscription.id, resetData);
      subscription = { ...subscription, ...resetData };
    }

    const limitData = getLimitData(type, plan, subscription);
    const can_use = limitData.used < limitData.limit;
    const remaining = Math.max(0, limitData.limit - limitData.used);

    const response = {
      can_use,
      remaining,
      limit: limitData.limit,
      used: limitData.used,
      plan_name: plan.name,
      percentage_used: Math.round((limitData.used / limitData.limit) * 100)
    };

    // Cache the result
    cache.set(cacheKey, { data: response, timestamp: Date.now() });

    return Response.json(response);
  } catch (error) {
    console.error('checkUserLimits error:', error);
    return Response.json(
      { error: 'Validation failed', details: error.message },
      { status: 400 }
    );
  }
});