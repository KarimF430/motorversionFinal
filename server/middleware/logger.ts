import type { Request, Response, NextFunction } from 'express';

/**
 * Request Logger Middleware
 * Logs all incoming requests with timing information
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path, ip } = req;

  // Log request
  console.log(`📥 ${method} ${path} - IP: ${ip || 'unknown'}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const statusEmoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';

    console.log(`${statusEmoji} ${method} ${path} ${statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * Performance Logger
 * Logs slow requests (>1000ms)
 */
export function performanceLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`🐌 SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
}
