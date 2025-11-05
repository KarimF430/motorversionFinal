import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Initialize Redis client
 */
export function initRedis() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('⚠️  Redis URL not configured. Caching disabled.');
    console.log('   Set REDIS_URL in .env to enable caching');
    console.log('   Example: REDIS_URL=redis://localhost:6379');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    return redis;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    return null;
  }
}

/**
 * Get value from cache
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set value in cache with TTL (time to live in seconds)
 */
export async function setCache(key: string, value: any, ttl: number = 3600): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Cache exists error for key ${key}:`, error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  if (!redis) return null;

  try {
    const info = await redis.info('stats');
    const memory = await redis.info('memory');

    return {
      connected: redis.status === 'ready',
      info,
      memory,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
}

/**
 * Cache wrapper for functions
 */
export async function withCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, execute function
  const result = await fn();

  // Store in cache
  await setCache(key, result, ttl);

  return result;
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('✅ Redis connection closed');
  }
}

export default redis;
