/**
 * Redis Client for Production Rate Limiting and Caching
 * 
 * Uses Upstash Redis REST API for serverless-friendly Redis access.
 * Falls back to in-memory storage if Redis is not configured.
 */

import { env } from '@/lib/env';

// In-memory fallback storage
const inMemoryCache = new Map<string, { value: string; expiresAt: number }>();
const inMemoryRateLimit = new Map<string, { count: number; resetAt: number }>();

let redisClient: any = null;
let useRedis = false;

// Initialize Redis client if credentials are available
if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    // Dynamic import to avoid bundling in client-side code
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    useRedis = true;
    console.log('[Redis] Connected to Upstash Redis');
  } catch (error) {
    console.warn('[Redis] Failed to initialize Redis client, using in-memory fallback:', error);
    useRedis = false;
  }
} else {
  console.log('[Redis] Redis credentials not configured, using in-memory fallback');
}

/**
 * Get value from cache (Redis or in-memory)
 */
export async function getCache(key: string): Promise<string | null> {
  if (useRedis && redisClient) {
    try {
      const value = await redisClient.get(key);
      return value as string | null;
    } catch (error) {
      console.error('[Redis] Error getting cache:', error);
      // Fallback to in-memory
      const cached = inMemoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
      if (cached) {
        inMemoryCache.delete(key);
      }
      return null;
    }
  }

  // In-memory fallback
  const cached = inMemoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (cached) {
    inMemoryCache.delete(key);
  }
  return null;
}

/**
 * Set value in cache with TTL (Redis or in-memory)
 */
export async function setCache(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (useRedis && redisClient) {
    try {
      await redisClient.set(key, value, { ex: ttlSeconds });
      return;
    } catch (error) {
      console.error('[Redis] Error setting cache:', error);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  // Clean up old entries if cache gets too large
  if (inMemoryCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of inMemoryCache.entries()) {
      if (v.expiresAt <= now) {
        inMemoryCache.delete(k);
      }
    }
  }
}

/**
 * Delete cache entry
 */
export async function deleteCache(key: string): Promise<void> {
  if (useRedis && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (error) {
      console.error('[Redis] Error deleting cache:', error);
    }
  }

  inMemoryCache.delete(key);
}

/**
 * Increment rate limit counter
 * Returns: { count, resetAt (timestamp in ms) }
 */
export async function incrementRateLimit(
  key: string,
  windowSeconds: number
): Promise<{ count: number; resetAt: number }> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;

  if (useRedis && redisClient) {
    try {
      // Use Redis INCR with expiration
      const count = await redisClient.incr(key);
      
      // Set expiration on first increment
      if (count === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      return { count, resetAt };
    } catch (error) {
      console.error('[Redis] Error incrementing rate limit:', error);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  const existing = inMemoryRateLimit.get(key);
  if (!existing || now > existing.resetAt) {
    inMemoryRateLimit.set(key, { count: 1, resetAt });
    return { count: 1, resetAt };
  }

  existing.count++;
  return { count: existing.count, resetAt: existing.resetAt };
}

/**
 * Get current rate limit count
 */
export async function getRateLimit(key: string): Promise<{ count: number; resetAt: number } | null> {
  if (useRedis && redisClient) {
    try {
      const count = await redisClient.get(key);
      if (count === null) {
        return null;
      }
      // Get TTL to calculate resetAt
      const ttl = await redisClient.ttl(key);
      const resetAt = Date.now() + ttl * 1000;
      return { count: parseInt(count as string, 10) || 0, resetAt };
    } catch (error) {
      console.error('[Redis] Error getting rate limit:', error);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  const now = Date.now();
  const existing = inMemoryRateLimit.get(key);
  if (existing && now > existing.resetAt) {
    inMemoryRateLimit.delete(key);
    return null;
  }
  return existing || null;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return useRedis && redisClient !== null;
}
