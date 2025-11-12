import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware, addRateLimitHeaders } from '@/middleware/rate-limit';

const checkRateLimit = createRateLimitMiddleware('basic');

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const userId = request.headers.get('x-user-id') || 'default-user';

    // Mock status data - in production, aggregate from database/cache
    const statusData = {
      agent: {
        pubkey: userId,
        balance: 245.82,
        tier: 'premium',
        status: 'active',
      },
      subscriptions: {
        active: 3,
        paused: 1,
        total: 4,
      },
      monitored: [
        {
          symbol: 'SOL',
          address: 'So11111111111111111111111111111111111111112',
          price: 142.35,
          priceChange24h: 5.2,
          riskScore: 45,
          status: 'monitored',
          alerts24h: 2,
        },
        {
          symbol: 'USDC',
          address: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
          price: 1.0,
          priceChange24h: 0.1,
          riskScore: 18,
          status: 'monitored',
          alerts24h: 0,
        },
        {
          symbol: 'ORCA',
          address: 'orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS',
          price: 2.45,
          priceChange24h: -8.3,
          riskScore: 72,
          status: 'monitored',
          alerts24h: 5,
        },
      ],
      alerts: {
        lastTriggered: '5 minutes ago',
        thisWeek: 12,
        thisMonth: 47,
      },
      billing: {
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        costPerAlert: 0.25,
        estimatedMonthly: 11.75,
        upcomingCharges: 47.0,
      },
      health: {
        webhookStatus: 'healthy',
        lastHealthCheck: '2 minutes ago',
        averageResponseTime: '0.23s',
        successRate: 98.9,
      },
    };

    const response = NextResponse.json(statusData);
    return addRateLimitHeaders(response, 0, 100);
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
