import { Express } from 'express'
import helmet from 'helmet'
import compression from 'compression'
import mongoSanitize from 'express-mongo-sanitize'

/**
 * Comprehensive security middleware
 * Protects against common vulnerabilities
 */
export function setupSecurity(app: Express) {
  // Helmet - Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.motoroctane.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  }))

  // Compression - Gzip responses
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
    level: 6, // Balanced compression
    threshold: 1024 // Only compress responses > 1KB
  }))

  // MongoDB injection protection
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️  Sanitized key: ${key} in request from ${req.ip}`)
    }
  }))

  // Request size limiting
  app.use((req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0')
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Request entity too large'
      })
    }

    next()
  })

  // IP-based request tracking
  app.use((req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    req.clientIp = ip
    next()
  })

  console.log('✅ Security middleware configured')
}

/**
 * Input sanitization middleware
 * Removes potentially dangerous characters
 */
export function sanitizeInput(req: any, res: any, next: any) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize)
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key])
      }
      return sanitized
    }
    
    return obj
  }

  if (req.body) req.body = sanitize(req.body)
  if (req.query) req.query = sanitize(req.query)
  if (req.params) req.params = sanitize(req.params)

  next()
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      clientIp?: string
    }
  }
}
