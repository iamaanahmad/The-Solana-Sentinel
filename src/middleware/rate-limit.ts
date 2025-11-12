import { cache } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
  message?: string;
}

export interface RateLimitOptions {
  keyPrefix?: string;
  skip?: (req: NextRequest) => boolean;
}

// Default rate limit configs
const DEFAULT_LIMITS = {
  basic: { maxRequests: 100, windowMs: 60000 }, // 100 req/min
  premium: { maxRequests: 500, windowMs: 60000 }, // 500 req/min
  public: { maxRequests: 30, windowMs: 60000 }, // 30 req/min for public endpoints
};

/**
 * Get user tier from request headers or params
 * For now, we'll check for a user ID or API key in headers
 * In production, this would validate against subscription database
 */
function getUserTier(req: NextRequest): 'basic' | 'premium' | 'public' {
  try {
    const userId = req.headers.get('x-user-id');
    const apiKey = req.headers.get('x-api-key');

    // If no auth headers, treat as public
    if (!userId && !apiKey) {
      return 'public';
    }

    // Check if premium (could check against subscription service in production)
    // For now, basic heuristic: if they have a user ID, they're at least basic tier
    return userId ? 'basic' : 'public';
  } catch {
    return 'public';
  }
}

/**
 * Create a rate limit middleware for Next.js App Router
 * Returns a function that checks rate limits before processing requests
 *
 * Usage in route handler:
 * ```
 * const checkRateLimit = createRateLimitMiddleware('basic');
 *
 * export async function POST(req: NextRequest) {
 *   const rateLimitResponse = await checkRateLimit(req);
 *   if (rateLimitResponse) return rateLimitResponse; // Rate limited
 *
 *   // Your handler code here
 * }
 * ```
 */
export function createRateLimitMiddleware(
  tier: 'basic' | 'premium' | 'public' = 'basic',
  options: RateLimitOptions = {}
) {
  const { keyPrefix = 'ratelimit', skip } = options;
  const config = DEFAULT_LIMITS[tier];

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Skip if condition met
    if (skip?.(req)) {
      return null;
    }

    try {
      // Get identifier (user ID, IP, or API key)
      const identifier =
        req.headers.get('x-user-id') ||
        req.headers.get('x-api-key') ||
        req.headers.get('x-forwarded-for') ||
        req.headers.get('cf-connecting-ip') ||
        'anonymous';

      const key = `${keyPrefix}:${tier}:${identifier}`;

      // Get current count from cache
      const data = await cache.get(key);
      const current = data ? parseInt(data as string) : 0;

      // Check if limit exceeded
      if (current >= config.maxRequests) {
        const resetTime = new Date(
          Date.now() + config.windowMs
        ).toISOString();

        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            message: `Rate limit exceeded for ${tier} tier (${config.maxRequests} req/${config.windowMs / 1000}s)`,
            retryAfter: Math.ceil(config.windowMs / 1000),
            resetTime,
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(
                Date.now() + config.windowMs
              ).toISOString(),
            },
          }
        );
      }

      // Increment counter
      const newCount = current + 1;
      await cache.set(key, newCount.toString(), config.windowMs / 1000);

      // Optionally attach rate limit info to response headers
      // This will be used by response interceptors
      req.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      req.headers.set(
        'X-RateLimit-Remaining',
        (config.maxRequests - newCount).toString()
      );

      return null; // Not rate limited, proceed
    } catch (error) {
      // On error, allow request through (fail open)
      console.error('Rate limit check error:', error);
      return null;
    }
  };
}

/**
 * Get dynamic rate limit based on actual user tier from database
 * This is more expensive as it queries the database for user info
 */
export async function createDynamicRateLimitMiddleware(
  options: RateLimitOptions = {}
) {
  const { keyPrefix = 'ratelimit', skip } = options;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Skip if condition met
    if (skip?.(req)) {
      return null;
    }

    try {
      const userTier = getUserTier(req);
      const config = DEFAULT_LIMITS[userTier];

      // Get identifier
      const identifier =
        req.headers.get('x-user-id') ||
        req.headers.get('x-api-key') ||
        req.headers.get('x-forwarded-for') ||
        req.headers.get('cf-connecting-ip') ||
        'anonymous';

      const key = `${keyPrefix}:${userTier}:${identifier}`;

      // Get current count
      const data = await cache.get(key);
      const current = data ? parseInt(data as string) : 0;

      // Check if limit exceeded
      if (current >= config.maxRequests) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            message: `Rate limit exceeded for ${userTier} tier`,
            retryAfter: Math.ceil(config.windowMs / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      // Increment counter
      const newCount = current + 1;
      await cache.set(key, newCount.toString(), config.windowMs / 1000);

      return null; // Not rate limited
    } catch (error) {
      console.error('Dynamic rate limit error:', error);
      return null; // Fail open
    }
  };
}

/**
 * Response wrapper to add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  limit: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}

/**
 * Manual rate limit check (for use outside of middleware context)
 */
export async function checkRateLimit(
  identifier: string,
  tier: 'basic' | 'premium' | 'public' = 'basic',
  keyPrefix: string = 'ratelimit'
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const config = DEFAULT_LIMITS[tier];
  const key = `${keyPrefix}:${tier}:${identifier}`;

  const data = await cache.get(key);
  const current = data ? parseInt(data as string) : 0;

  if (current >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }

  const newCount = current + 1;
  await cache.set(key, newCount.toString(), config.windowMs / 1000);

  return {
    allowed: true,
    remaining: config.maxRequests - newCount,
    resetTime: new Date(Date.now() + config.windowMs),
  };
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(
  identifier: string,
  tier: 'basic' | 'premium' | 'public' = 'basic',
  keyPrefix: string = 'ratelimit'
): Promise<void> {
  const key = `${keyPrefix}:${tier}:${identifier}`;
  await cache.del(key);
}

/**
 * Get current rate limit status for an identifier
 */
export async function getRateLimitStatus(
  identifier: string,
  tier: 'basic' | 'premium' | 'public' = 'basic',
  keyPrefix: string = 'ratelimit'
): Promise<{
  current: number;
  limit: number;
  remaining: number;
  resetTime: Date;
}> {
  const config = DEFAULT_LIMITS[tier];
  const key = `${keyPrefix}:${tier}:${identifier}`;

  const data = await cache.get(key);
  const current = data ? parseInt(data as string) : 0;

  return {
    current,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current),
    resetTime: new Date(Date.now() + config.windowMs),
  };
}

export default createRateLimitMiddleware;
