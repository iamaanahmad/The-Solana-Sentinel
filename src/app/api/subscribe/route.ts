import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';
import { createRateLimitMiddleware, addRateLimitHeaders } from '@/middleware/rate-limit';

// Initialize rate limiting for this route (basic tier: 100 req/min)
const checkRateLimit = createRateLimitMiddleware('basic', {
  keyPrefix: 'ratelimit:subscribe',
});

/**
 * POST /api/subscribe
 * Create a new subscription for risk monitoring
 */
export async function POST(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { agentPubkey, tokenAddress, webhookUrl, thresholds } = body;

    // Validate required fields
    if (!agentPubkey || !tokenAddress || !webhookUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: agentPubkey, tokenAddress, webhookUrl' },
        { status: 400 }
      );
    }

    if (!thresholds || typeof thresholds !== 'object') {
      return NextResponse.json(
        { error: 'Invalid thresholds: must be an object' },
        { status: 400 }
      );
    }

    // Create subscription
    const result = await SubscriptionService.createSubscription(
      tokenAddress,
      agentPubkey,
      webhookUrl,
      thresholds
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Subscription created successfully',
        data: result,
      },
      { status: 201 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscribe?agentPubkey=xxx
 * List all subscriptions for an agent
 */
export async function GET(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const agentPubkey = searchParams.get('agentPubkey');

    if (!agentPubkey) {
      return NextResponse.json(
        { error: 'Missing required parameter: agentPubkey' },
        { status: 400 }
      );
    }

    const subscriptions = await SubscriptionService.listUserSubscriptions(agentPubkey);

    const response = NextResponse.json(
      {
        success: true,
        data: subscriptions,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/subscribe
 * Update a subscription
 */
export async function PATCH(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { subscriptionId, thresholds, webhookUrl } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required field: subscriptionId' },
        { status: 400 }
      );
    }

    const success = await SubscriptionService.updateSubscription(
      subscriptionId,
      thresholds,
      webhookUrl
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Subscription not found or update failed' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Subscription updated successfully',
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscribe?subscriptionId=xxx
 * Deactivate a subscription
 */
export async function DELETE(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: subscriptionId' },
        { status: 400 }
      );
    }

    const success = await SubscriptionService.deactivateSubscription(subscriptionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Subscription not found or deletion failed' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Subscription cancelled successfully',
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Error deleting subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
