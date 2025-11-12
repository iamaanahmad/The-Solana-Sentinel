import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware, addRateLimitHeaders } from '@/middleware/rate-limit';

const checkRateLimit = createRateLimitMiddleware('basic');

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const userId = request.headers.get('x-user-id') || 'default-user';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const filter = request.nextUrl.searchParams.get('filter') || 'all';

    // Mock alert history - in production, fetch from database
    const allAlerts = [
      {
        id: 'alert-001',
        token: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        riskScore: 82,
        priceChange: 8.5,
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 10000).toISOString(),
        subscriptionId: 'sub-001',
      },
      {
        id: 'alert-002',
        token: 'USDC',
        address: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
        riskScore: 95,
        priceChange: 12.3,
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 45000).toISOString(),
        subscriptionId: 'sub-002',
      },
      {
        id: 'alert-003',
        token: 'ORCA',
        address: 'orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS',
        riskScore: 45,
        priceChange: 2.1,
        status: 'pending',
        triggeredAt: new Date(Date.now() - 300000).toISOString(),
        subscriptionId: 'sub-003',
      },
      {
        id: 'alert-004',
        token: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        riskScore: 88,
        priceChange: 11.2,
        status: 'failed',
        failureReason: 'Webhook timeout',
        triggeredAt: new Date(Date.now() - 3600000).toISOString(),
        subscriptionId: 'sub-001',
      },
    ];

    // Filter alerts
    const filtered = allAlerts.filter((alert) => {
      if (filter === 'delivered') return alert.status === 'delivered';
      if (filter === 'failed') return alert.status === 'failed';
      if (filter === 'pending') return alert.status === 'pending';
      return true;
    });

    const alerts = filtered.slice(0, limit);

    const response = NextResponse.json({
      alerts,
      total: filtered.length,
      limit,
      filter,
    });

    // Add rate limit headers
    return addRateLimitHeaders(response, 0, 100);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert history' },
      { status: 500 }
    );
  }
}
