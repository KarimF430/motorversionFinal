import express, { Request, Response } from 'express';
import { redis } from '../middleware/cache.js';

const router = express.Router();

/**
 * Batch endpoint for homepage data
 * Returns all data needed for homepage in single request
 * Cached for 5 minutes in Redis
 */
router.get('/homepage', async (req: Request, res: Response) => {
  try {
    // Check Redis cache first
    const cacheKey = 'homepage:data:v1';
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('✅ Homepage data served from cache');
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
        timestamp: Date.now(),
      });
    }

    console.log('📊 Fetching fresh homepage data...');

    // Import storage
    const { MongoDBStorage } = await import('../server/db/mongodb-storage.js');
    const storage = new MongoDBStorage();

    // Fetch all data in parallel for maximum speed
    const [allBrands, allModels, allVariants] = await Promise.all([
      storage.getBrands(),
      storage.getModels(),
      storage.getVariants(),
    ]);

    // Filter active brands
    const brands = allBrands
      .filter((b: any) => b.status === 'active')
      .sort((a: any, b: any) => (a.ranking || 999) - (b.ranking || 999))
      .slice(0, 16); // Top 16 brands

    // Filter and categorize models
    const activeModels = allModels.filter((m: any) => m.status === 'active');

    const popularModels = activeModels
      .filter((m: any) => m.isPopular)
      .sort((a: any, b: any) => (a.popularRank || 999) - (b.popularRank || 999))
      .slice(0, 10);

    const newModels = activeModels
      .filter((m: any) => m.isNew)
      .sort((a: any, b: any) => (b.launchDate || '').localeCompare(a.launchDate || ''))
      .slice(0, 10);

    // Budget categories
    const budgetModels = {
      under5: activeModels
        .filter((m: any) => m.startingPrice && m.startingPrice <= 500000)
        .sort((a: any, b: any) => a.startingPrice - b.startingPrice)
        .slice(0, 10),
      under8: activeModels
        .filter((m: any) => m.startingPrice && m.startingPrice <= 800000)
        .sort((a: any, b: any) => a.startingPrice - b.startingPrice)
        .slice(0, 10),
      under10: activeModels
        .filter((m: any) => m.startingPrice && m.startingPrice <= 1000000)
        .sort((a: any, b: any) => a.startingPrice - b.startingPrice)
        .slice(0, 10),
      under15: activeModels
        .filter((m: any) => m.startingPrice && m.startingPrice <= 1500000)
        .sort((a: any, b: any) => a.startingPrice - b.startingPrice)
        .slice(0, 10),
    };

    // Popular comparisons (simple logic - can be enhanced)
    const popularComparisons = popularModels.slice(0, 5).map((model: any, index: number) => ({
      model1: model,
      model2: popularModels[index + 1] || popularModels[0],
    }));

    // Build response
    const data = {
      brands,
      popularModels,
      newModels,
      budgetModels,
      popularComparisons,
      stats: {
        totalBrands: brands.length,
        totalModels: activeModels.length,
        totalVariants: allVariants.length,
      },
    };

    // Cache for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    console.log('✅ Homepage data cached successfully');

    res.json({
      success: true,
      data,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Homepage data fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homepage data',
    });
  }
});

/**
 * Clear homepage cache (for admin use)
 */
router.post('/homepage/clear-cache', async (req: Request, res: Response) => {
  try {
    await redis.del('homepage:data:v1');
    res.json({
      success: true,
      message: 'Homepage cache cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

export default router;
