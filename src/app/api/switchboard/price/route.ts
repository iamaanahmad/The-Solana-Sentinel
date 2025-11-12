import { NextRequest, NextResponse } from 'next/server';
import { SwitchboardService } from '@/services/switchboard.service';
import { createRateLimitMiddleware, addRateLimitHeaders } from '@/middleware/rate-limit';

// Rate limiting - price queries can be higher tier (premium tier)
const checkRateLimit = createRateLimitMiddleware('premium', {
  keyPrefix: 'ratelimit:switchboard-price',
});

let switchboardService: SwitchboardService | null = null;

async function initializeSwitchboard() {
  if (!switchboardService) {
    switchboardService = await SwitchboardService.initialize();
  }
  return switchboardService;
}

/**
 * GET /api/switchboard/price?tokenAddress=xxx
 * Get current price for a token
 */
export async function GET(req: NextRequest) {
  // Check rate limit (premium tier: 500 req/min)
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    const service = await initializeSwitchboard();
    const price = await service.getCurrentPrice(tokenAddress);

    if (price === 0) {
      return NextResponse.json(
        { error: 'Unable to fetch price for token', tokenAddress },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        tokenAddress,
        price,
        timestamp: new Date().toISOString(),
        source: 'switchboard-oracle',
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, 499, 500);
  } catch (error) {
    console.error('❌ Error fetching price:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
