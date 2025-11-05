import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redis } from './cache'

/**
 * General API rate limiting
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain IPs (optional)
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || []
    return trustedIPs.includes(req.ip || '')
  }
})

/**
 * Strict rate limiting for search endpoints
 * 30 requests per minute per IP
 */
export const searchLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:search:'
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many search requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Very strict rate limiting for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
})

/**
 * Moderate rate limiting for data modification
 * 20 requests per 5 minutes per IP
 */
export const modifyLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:modify:'
  }),
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many modification requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Lenient rate limiting for static content
 * 200 requests per 15 minutes per IP
 */
export const staticLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:static:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
})
