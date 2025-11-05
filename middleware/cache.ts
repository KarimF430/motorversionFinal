import { Request, Response, NextFunction } from 'express'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

redis.on('error', (err) => console.error('Redis Client Error:', err))
redis.on('connect', () => console.log('✅ Redis Cache Connected'))

/**
 * Cache middleware for API responses
 * Usage: router.get('/api/models', cacheMiddleware(600), getModels)
 */
export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next()
    }

    const key = `cache:${req.originalUrl}`
    
    try {
      const cached = await redis.get(key)
      
      if (cached) {
        console.log(`✅ Cache HIT: ${key}`)
        return res.json(JSON.parse(cached))
      }
      
      console.log(`❌ Cache MISS: ${key}`)
      
      // Store original json method
      const originalJson = res.json.bind(res)
      
      // Override res.json to cache the response
      res.json = function(body: any) {
        // Cache the response
        redis.setex(key, ttl, JSON.stringify(body)).catch(err => {
          console.error('Cache write error:', err)
        })
        
        // Send response
        return originalJson(body)
      }
      
      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next() // Fail gracefully - don't break the request
    }
  }
}

/**
 * Invalidate cache by pattern
 * Usage: await invalidateCache('/api/models')
 */
export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(`cache:${pattern}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

/**
 * Cache with tags for group invalidation
 * Usage: await cacheWithTags('model:123', data, 600, ['models', 'brand:tata'])
 */
export async function cacheWithTags(
  key: string,
  data: any,
  ttl: number,
  tags: string[]
) {
  try {
    // Store the data
    await redis.setex(`cache:${key}`, ttl, JSON.stringify(data))
    
    // Store tag associations
    for (const tag of tags) {
      await redis.sadd(`tag:${tag}`, key)
      await redis.expire(`tag:${tag}`, ttl)
    }
  } catch (error) {
    console.error('Cache with tags error:', error)
  }
}

/**
 * Invalidate all cache entries with a specific tag
 * Usage: await invalidateCacheByTag('models')
 */
export async function invalidateCacheByTag(tag: string) {
  try {
    const keys = await redis.smembers(`tag:${tag}`)
    if (keys.length > 0) {
      const cacheKeys = keys.map(k => `cache:${k}`)
      await redis.del(...cacheKeys)
      await redis.del(`tag:${tag}`)
      console.log(`🗑️  Invalidated ${keys.length} cache entries with tag: ${tag}`)
    }
  } catch (error) {
    console.error('Tag invalidation error:', error)
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const info = await redis.info('stats')
    const keys = await redis.dbsize()
    
    return {
      totalKeys: keys,
      info: info
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return null
  }
}

export { redis }
