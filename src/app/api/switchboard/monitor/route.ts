import { NextRequest, NextResponse } from 'next/server';
import { SwitchboardService } from '@/services/switchboard.service';
import { createRateLimitMiddleware, addRateLimitHeaders } from '@/middleware/rate-limit';

// Rate limiting
const checkRateLimit = createRateLimitMiddleware('basic', {
  keyPrefix: 'ratelimit:switchboard',
});

// Global Switchboard service instance
let switchboardService: SwitchboardService | null = null;

/**
 * Initialize the Switchboard service (called once)
 */
async function initializeSwitchboard() {
  if (!switchboardService) {
    switchboardService = await SwitchboardService.initialize();
  }
  return switchboardService;
}

/**
 * POST /api/switchboard/monitor
 * Start monitoring a token
 */
export async function POST(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { tokenAddress, feedAddress } = body;

    if (!tokenAddress || !feedAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenAddress, feedAddress' },
        { status: 400 }
      );
    }

    const service = await initializeSwitchboard();
    await service.startMonitoring(tokenAddress, feedAddress);

    const response = NextResponse.json(
      {
        success: true,
        message: `Started monitoring ${tokenAddress}`,
        tokenAddress,
      },
      { status: 201 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Error starting monitoring:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start monitoring' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/switchboard/monitor?tokenAddress=xxx
 * Get monitoring status for a token
 */
export async function GET(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const action = searchParams.get('action');

    const service = await initializeSwitchboard();

    // Get status of all monitored tokens
    if (action === 'list') {
      const monitoredTokens = service.getMonitoredTokens();
      const statuses = monitoredTokens.map((token) => ({
        tokenAddress: token,
        status: service.getMonitoringStatus(token),
      }));

      const response = NextResponse.json(
        {
          success: true,
          monitoredTokens: statuses,
        },
        { status: 200 }
      );

      return addRateLimitHeaders(response, 99, 100);
    }

    // Get status of specific token
    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    const status = service.getMonitoringStatus(tokenAddress);

    if (!status) {
      return NextResponse.json(
        { error: 'Token not being monitored', tokenAddress },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        tokenAddress,
        status,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Error fetching monitoring status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/switchboard/monitor?tokenAddress=xxx
 * Stop monitoring a token
 */
export async function DELETE(req: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const action = searchParams.get('action');

    if (!tokenAddress && action !== 'stopAll') {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    const service = await initializeSwitchboard();

    if (action === 'stopAll') {
      await service.stopAllMonitoring();
      const response = NextResponse.json(
        {
          success: true,
          message: 'Stopped monitoring all tokens',
        },
        { status: 200 }
      );
      return addRateLimitHeaders(response, 99, 100);
    }

    await service.stopMonitoring(tokenAddress!);

    const response = NextResponse.json(
      {
        success: true,
        message: `Stopped monitoring ${tokenAddress}`,
        tokenAddress,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, 99, 100);
  } catch (error) {
    console.error('❌ Error stopping monitoring:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stop monitoring' },
      { status: 500 }
    );
  }
}
