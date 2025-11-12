import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user';

    // Get cache key for user dashboard stats
    const cacheKey = `sentinel:dashboard:${userId}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached as string));
    }

    // Mock dashboard data - in production, aggregate from database
    const dashboardData = {
      stats: {
        activeSubscriptions: 3,
        alertsThisWeek: 12,
        alertsThisMonth: 47,
        totalBalance: 250.5,
        estimatedMonthlySpend: 11.75,
      },
      topTokens: [
        {
          symbol: 'SOL',
          price: 142.35,
          priceChange24h: 5.2,
          riskScore: 45,
          volume24h: 45000000,
        },
        {
          symbol: 'USDC',
          price: 1.0,
          priceChange24h: 0.1,
          riskScore: 18,
          volume24h: 120000000,
        },
        {
          symbol: 'ORCA',
          price: 2.45,
          priceChange24h: -8.3,
          riskScore: 72,
          volume24h: 15000000,
        },
      ],
      recentAlerts: [
        {
          id: 'alert-001',
          token: 'SOL',
          message: 'Price surge detected (+5.2% in 24h)',
          severity: 'warning',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 'alert-002',
          token: 'ORCA',
          message: 'High volatility alert (-8.3% drop)',
          severity: 'critical',
          timestamp: new Date(Date.now() - 900000).toISOString(),
        },
      ],
      tierInfo: {
        currentTier: 'premium',
        requestsUsed: 1250,
        requestsLimit: 5000,
        costPerAlert: 0.25,
      },
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(dashboardData), 300);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
