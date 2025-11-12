import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 * Get or create Redis client
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          // Exponential backoff: 50ms, 100ms, 200ms, etc.
          return Math.min(retries * 50, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis client connected');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });

    await redisClient.connect();
  }

  return redisClient;
}

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', { key, error });
      return null;
    }
  },

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = await getRedisClient();
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serialized);
      } else {
        await client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Redis SET error:', { key, error });
      return false;
    }
  },

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', { key, error });
      return false;
    }
  },

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', { key, error });
      return false;
    }
  },

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number> {
    try {
      const client = await getRedisClient();
      return await client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', { key, error });
      throw error;
    }
  },

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const client = await getRedisClient();
      const result = await client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', { key, error });
      return false;
    }
  },

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = await getRedisClient();
      return await client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', { key, error });
      return -1;
    }
  },
};

/**
 * Rate limiting helper
 */
export const rateLimit = {
  /**
   * Check and increment rate limit counter
   * Returns true if limit is exceeded
   */
  async checkLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ limited: boolean; current: number; remaining: number; resetAt: number }> {
    try {
      const client = await getRedisClient();
      const key = `rate_limit:${identifier}`;
      
      const current = await client.incr(key);
      
      if (current === 1) {
        // First request in window, set expiration
        await client.expire(key, windowSeconds);
      }
      
      const ttl = await client.ttl(key);
      const resetAt = Date.now() + (ttl * 1000);
      
      return {
        limited: current > limit,
        current,
        remaining: Math.max(0, limit - current),
        resetAt,
      };
    } catch (error) {
      console.error('Rate limit check error:', { identifier, error });
      // Fail open - don't block on Redis errors
      return {
        limited: false,
        current: 0,
        remaining: limit,
        resetAt: Date.now() + (windowSeconds * 1000),
      };
    }
  },

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    return await cache.del(key);
  },
};

/**
 * Close Redis connection (useful for graceful shutdown)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis connection closed');
  }
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}
