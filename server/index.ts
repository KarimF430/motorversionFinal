import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MongoDBStorage } from "./db/mongodb-storage";
import { createBackupService } from "./backup-service";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { requestLogger, performanceLogger } from "./middleware/logger";
import { initSentry, sentryErrorHandler } from "./monitoring/sentry";
import { initRedis } from "./cache/redis-client";
import uploadRoutes from "./routes/upload.routes.js";
import aiSearchRoutes from "../routes/ai-search.routes.js";
import homepageRoutes from "../routes/homepage.routes.js";
import dotenv from "dotenv";
// New production-ready middleware
import { setupSecurity, sanitizeInput } from '../middleware/security.js';
import { apiLimiter, searchLimiter, authLimiter } from '../middleware/rate-limit.js';
import { cacheMiddleware } from '../middleware/cache.js';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Sentry (must be first)
initSentry(app);

// ============================================
// PRODUCTION-READY SECURITY & PERFORMANCE
// ============================================

// Setup comprehensive security (Helmet, Compression, sanitization, etc.)
setupSecurity(app);

// Input sanitization (prevents XSS, NoSQL injection)
app.use(sanitizeInput);

// Advanced rate limiting (Redis-backed, per-endpoint)
app.use('/api/', apiLimiter);           // General API: 100 req/15min
app.use('/api/search', searchLimiter);  // Search: 30 req/min
app.use('/api/auth', authLimiter);      // Auth: 5 req/15min

// ============================================
// Old rate limiters removed - using new Redis-backed limiters above

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);
app.use(performanceLogger);

// Add CORS headers for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize MongoDB storage
  const storage = new MongoDBStorage();
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/motoroctane';
  
  try {
    await storage.connect(mongoUri);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB. Please check:');
    console.error('   1. MongoDB is running (brew services start mongodb-community)');
    console.error('   2. MONGODB_URI in .env file is correct');
    console.error('   3. Network connection is available');
    process.exit(1);
  }
  
  // Initialize Redis cache
  const redis = initRedis();
  
  // Initialize backup service
  const backupService = createBackupService(storage);
  
  // Start automatic backups every 30 minutes
  backupService.startAutoBackup(30);
  
  // Register API routes FIRST before Vite
  registerRoutes(app, storage, backupService);
  
  // Register Cloudinary upload routes
  app.use('/api/upload', uploadRoutes);
  
  // Register AI search routes
  app.use('/api', aiSearchRoutes);
  
  // Register homepage batch endpoint (critical for performance)
  app.use('/api', homepageRoutes);
  
  const server = createServer(app);

  // Setup Vite AFTER all API routes are registered
  // This ensures API routes take precedence over Vite's catch-all
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  // 404 handler for unknown routes
  app.use(notFoundHandler);
  
  // Sentry error handler (must be before other error handlers)
  app.use(sentryErrorHandler());
  
  // Global error handler (must be last)
  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.log('✅ Server features enabled:');
    console.log('   - Rate limiting (100 req/15min)');
    console.log('   - Security headers (Helmet.js)');
    console.log('   - Gzip compression');
    console.log('   - Request logging');
    console.log('   - Error handling');
    console.log('   - Error tracking (Sentry)');
    console.log('   - Caching (Redis)');
    console.log('   - Health check: /api/health');
  });
})();
