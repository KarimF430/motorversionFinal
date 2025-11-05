import express from 'express'
import { searchCars, getAutocompleteSuggestions, getSearchFacets } from '../services/elasticsearch'

const router = express.Router()

/**
 * Advanced car search with Elasticsearch
 * GET /api/search/cars
 * 
 * Query params:
 * - q: Search query
 * - brands: Comma-separated brand names
 * - bodyTypes: Comma-separated body types
 * - fuelTypes: Comma-separated fuel types
 * - transmissions: Comma-separated transmissions
 * - priceMin: Minimum price
 * - priceMax: Maximum price
 * - seating: Comma-separated seating capacities
 * - isNew: Boolean
 * - isPopular: Boolean
 * - sortBy: price|popularity|rating|name|launchDate
 * - sortOrder: asc|desc
 * - page: Page number (default: 1)
 * - size: Results per page (default: 20)
 */
router.get('/cars', async (req, res) => {
  try {
    const {
      q,
      brands,
      bodyTypes,
      fuelTypes,
      transmissions,
      priceMin,
      priceMax,
      seating,
      isNew,
      isPopular,
      sortBy,
      sortOrder,
      page,
      size
    } = req.query

    const searchParams = {
      query: q as string,
      brands: brands ? (brands as string).split(',') : [],
      bodyTypes: bodyTypes ? (bodyTypes as string).split(',') : [],
      fuelTypes: fuelTypes ? (fuelTypes as string).split(',') : [],
      transmissions: transmissions ? (transmissions as string).split(',') : [],
      priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
      priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
      seatingCapacity: seating ? (seating as string).split(',').map(Number) : [],
      isNew: isNew === 'true' ? true : isNew === 'false' ? false : undefined,
      isPopular: isPopular === 'true' ? true : isPopular === 'false' ? false : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: page ? parseInt(page as string) : 1,
      size: size ? parseInt(size as string) : 20
    }

    const results = await searchCars(searchParams)

    res.json({
      success: true,
      data: results.hits,
      pagination: {
        page: results.page,
        size: results.size,
        total: results.total,
        totalPages: results.totalPages
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Autocomplete suggestions
 * GET /api/search/autocomplete
 * 
 * Query params:
 * - q: Search query
 * - size: Number of suggestions (default: 10)
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, size } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      })
    }

    const suggestions = await getAutocompleteSuggestions(
      q,
      size ? parseInt(size as string) : 10
    )

    res.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    console.error('Autocomplete error:', error)
    res.status(500).json({
      success: false,
      error: 'Autocomplete failed'
    })
  }
})

/**
 * Get search facets for filters
 * GET /api/search/facets
 */
router.get('/facets', async (req, res) => {
  try {
    const facets = await getSearchFacets()

    res.json({
      success: true,
      data: facets
    })
  } catch (error) {
    console.error('Facets error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch facets'
    })
  }
})

export default router
