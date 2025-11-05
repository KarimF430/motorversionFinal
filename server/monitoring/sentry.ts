import * as Sentry from '@sentry/node';
import type { Express } from 'express';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry(app: Express) {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN not configured. Error tracking disabled.');
    console.log('   Set SENTRY_DSN in .env to enable Sentry');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from context
      if (event.contexts?.user) {
        delete event.contexts.user.email;
      }

      return event;
    },
  });

  console.log('✅ Sentry initialized for error tracking');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
}

/**
 * Error handler middleware (must be added after all routes)
 */
export function sentryErrorHandler() {
  return (err: any, req: any, res: any, next: any) => {
    Sentry.captureException(err);
    next(err);
  };
}

/**
 * Manually capture an error
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add user context to errors
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // Don't send email to Sentry for privacy
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add custom context
 */
export function addContext(key: string, value: any) {
  Sentry.setContext(key, value);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  // Note: Use Sentry.startSpan in newer versions
  return null;
}
