import { Router, Request, Response } from 'express';
import {
  parseNaturalLanguageQuery,
  generateRecommendations,
  generateComparison,
  generateConversationalResponse,
} from '../services/ai-search.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { searchLimiter } from '../middleware/rate-limit.js';

const router = Router();

/**
 * POST /api/ai-search
 * Natural language car search
 */
router.post('/ai-search', searchLimiter, async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    console.log(`🤖 AI Search Query: "${query}"`);

    // Parse natural language query
    const aiResult = await parseNaturalLanguageQuery(query);

    // Build MongoDB query from AI result
    const mongoQuery: any = {};

    if (aiResult.query.budget) {
      mongoQuery.startingPrice = {
        $gte: aiResult.query.budget.min || 0,
        $lte: aiResult.query.budget.max || 100000000,
      };
    }

    if (aiResult.query.bodyType && aiResult.query.bodyType.length > 0) {
      mongoQuery.bodyType = { $in: aiResult.query.bodyType };
    }

    if (aiResult.query.fuelType && aiResult.query.fuelType.length > 0) {
      mongoQuery.fuelTypes = { $in: aiResult.query.fuelType };
    }

    if (aiResult.query.transmission && aiResult.query.transmission.length > 0) {
      mongoQuery.transmissions = { $in: aiResult.query.transmission };
    }

    if (aiResult.query.seating) {
      mongoQuery.seating = { $gte: aiResult.query.seating };
    }

    if (aiResult.query.brand && aiResult.query.brand.length > 0) {
      mongoQuery.brandName = { $in: aiResult.query.brand };
    }

    // Fetch matching cars from database
    const { MongoDBStorage } = await import('../server/db/mongodb-storage.js');
    const storage = new MongoDBStorage();

    // Get all models and filter
    const allModels = await storage.getModels();
    let matchingCars = allModels.filter((car: any) => {
      // Apply filters
      if (mongoQuery.startingPrice) {
        if (
          car.startingPrice < mongoQuery.startingPrice.$gte ||
          car.startingPrice > mongoQuery.startingPrice.$lte
        ) {
          return false;
        }
      }

      if (mongoQuery.bodyType && !mongoQuery.bodyType.$in.includes(car.bodyType)) {
        return false;
      }

      if (mongoQuery.fuelTypes) {
        const hasFuel = car.fuelTypes?.some((fuel: string) =>
          mongoQuery.fuelTypes.$in.includes(fuel)
        );
        if (!hasFuel) return false;
      }

      if (mongoQuery.transmissions) {
        const hasTrans = car.transmissions?.some((trans: string) =>
          mongoQuery.transmissions.$in.includes(trans)
        );
        if (!hasTrans) return false;
      }

      if (mongoQuery.seating && car.seating < mongoQuery.seating.$gte) {
        return false;
      }

      if (mongoQuery.brandName && !mongoQuery.brandName.$in.includes(car.brandName)) {
        return false;
      }

      return true;
    });

    // Sort results
    if (aiResult.query.sortBy === 'price') {
      matchingCars.sort((a: any, b: any) => a.startingPrice - b.startingPrice);
    } else if (aiResult.query.sortBy === 'mileage') {
      matchingCars.sort((a: any, b: any) => (b.mileage || 0) - (a.mileage || 0));
    } else if (aiResult.query.sortBy === 'popularity') {
      matchingCars.sort((a: any, b: any) => (b.popularRank || 999) - (a.popularRank || 999));
    }

    // Generate AI recommendations
    const recommendations = await generateRecommendations(query, matchingCars);

    res.json({
      success: true,
      data: {
        query: aiResult.query,
        explanation: aiResult.explanation,
        confidence: aiResult.confidence,
        suggestions: aiResult.suggestions,
        totalResults: matchingCars.length,
        recommendations: recommendations.recommendations,
        alternatives: recommendations.alternatives,
        recommendationExplanation: recommendations.explanation,
        allResults: matchingCars.slice(0, 20), // Return top 20
      },
    });
  } catch (error: any) {
    console.error('AI Search error:', error);
    res.status(500).json({
      success: false,
      error: 'AI search failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai-search/compare
 * AI-powered car comparison
 */
router.post('/compare', searchLimiter, async (req: Request, res: Response) => {
  try {
    const { car1Id, car2Id } = req.body;

    if (!car1Id || !car2Id) {
      return res.status(400).json({
        success: false,
        error: 'Both car IDs are required',
      });
    }

    const { MongoDBStorage } = await import('../server/db/mongodb-storage.js');
    const storage = new MongoDBStorage();

    const car1 = await storage.getModel(car1Id);
    const car2 = await storage.getModel(car2Id);

    if (!car1 || !car2) {
      return res.status(404).json({
        success: false,
        error: 'One or both cars not found',
      });
    }

    const comparison = await generateComparison(car1, car2);

    res.json({
      success: true,
      data: {
        car1,
        car2,
        comparison,
      },
    });
  } catch (error: any) {
    console.error('AI Comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Comparison failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai-search/chat
 * Conversational AI assistant
 */
router.post('/chat', searchLimiter, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const response = await generateConversationalResponse(message, context || {});

    res.json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/ai-search/suggestions
 * Get popular search suggestions
 */
router.get('/suggestions', cacheMiddleware(3600), async (req: Request, res: Response) => {
  const suggestions = [
    'Family car under 15 lakhs',
    'Best mileage cars in India',
    'SUV with sunroof under 20 lakhs',
    'Electric cars in India',
    '7 seater cars',
    'Automatic cars under 10 lakhs',
    'Luxury sedans',
    'Best cars for long drives',
    'Compact SUVs',
    'Cars with best safety features',
  ];

  res.json({
    success: true,
    data: suggestions,
  });
});

export default router;
