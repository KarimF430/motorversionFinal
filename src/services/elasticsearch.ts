import { Client } from '@elastic/elasticsearch'

// Elasticsearch client configuration
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  },
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
})

// Index names
export const INDICES = {
  MODELS: 'car_models',
  BRANDS: 'car_brands',
  VARIANTS: 'car_variants'
}

// Create indices with optimized mappings
export async function createIndices() {
  try {
    // Car Models Index
    const modelsIndexExists = await esClient.indices.exists({ index: INDICES.MODELS })
    if (!modelsIndexExists) {
      await esClient.indices.create({
        index: INDICES.MODELS,
        body: {
          settings: {
            number_of_shards: 3,
            number_of_replicas: 2,
            analysis: {
              analyzer: {
                car_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding', 'car_synonym']
                }
              },
              filter: {
                car_synonym: {
                  type: 'synonym',
                  synonyms: [
                    'suv, sport utility vehicle',
                    'mpv, multi purpose vehicle',
                    'sedan, saloon',
                    'hatchback, hatch',
                    'ev, electric vehicle, electric car'
                  ]
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { 
                type: 'text', 
                analyzer: 'car_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' }
                }
              },
              brandId: { type: 'keyword' },
              brandName: { 
                type: 'text',
                analyzer: 'car_analyzer',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              slug: { type: 'keyword' },
              description: { type: 'text', analyzer: 'car_analyzer' },
              bodyType: { type: 'keyword' },
              subBodyType: { type: 'keyword' },
              fuelTypes: { type: 'keyword' },
              transmissions: { type: 'keyword' },
              seatingCapacity: { type: 'integer' },
              price: { type: 'float' },
              priceRange: {
                type: 'integer_range'
              },
              mileage: { type: 'float' },
              engineCapacity: { type: 'integer' },
              power: { type: 'float' },
              torque: { type: 'float' },
              isNew: { type: 'boolean' },
              isPopular: { type: 'boolean' },
              rating: { type: 'float' },
              reviewCount: { type: 'integer' },
              launchDate: { type: 'date' },
              heroImage: { type: 'keyword', index: false },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      })
      console.log('✅ Created car_models index')
    }

    // Car Brands Index
    const brandsIndexExists = await esClient.indices.exists({ index: INDICES.BRANDS })
    if (!brandsIndexExists) {
      await esClient.indices.create({
        index: INDICES.BRANDS,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 2
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' }
                }
              },
              slug: { type: 'keyword' },
              logo: { type: 'keyword', index: false },
              description: { type: 'text' },
              summary: { type: 'text' },
              modelCount: { type: 'integer' },
              popularity: { type: 'integer' }
            }
          }
        }
      })
      console.log('✅ Created car_brands index')
    }

    // Car Variants Index
    const variantsIndexExists = await esClient.indices.exists({ index: INDICES.VARIANTS })
    if (!variantsIndexExists) {
      await esClient.indices.create({
        index: INDICES.VARIANTS,
        body: {
          settings: {
            number_of_shards: 3,
            number_of_replicas: 2
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              modelId: { type: 'keyword' },
              modelName: { type: 'text' },
              brandId: { type: 'keyword' },
              brandName: { type: 'text' },
              name: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              price: { type: 'float' },
              fuelType: { type: 'keyword' },
              transmission: { type: 'keyword' },
              engine: { type: 'text' },
              power: { type: 'text' },
              mileage: { type: 'float' },
              features: { type: 'text' },
              isValueForMoney: { type: 'boolean' }
            }
          }
        }
      })
      console.log('✅ Created car_variants index')
    }

    console.log('✅ All Elasticsearch indices ready')
  } catch (error) {
    console.error('❌ Error creating Elasticsearch indices:', error)
    throw error
  }
}

// Index a single document
export async function indexDocument(index: string, id: string, document: any) {
  try {
    await esClient.index({
      index,
      id,
      body: document,
      refresh: 'wait_for'
    })
  } catch (error) {
    console.error(`❌ Error indexing document to ${index}:`, error)
    throw error
  }
}

// Bulk index documents (efficient for large datasets)
export async function bulkIndexDocuments(index: string, documents: any[]) {
  try {
    const body = documents.flatMap(doc => [
      { index: { _index: index, _id: doc.id } },
      doc
    ])

    const { body: bulkResponse } = await esClient.bulk({ 
      refresh: 'wait_for', 
      body 
    })

    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.filter((item: any) => item.index?.error)
      console.error('❌ Bulk indexing errors:', erroredDocuments)
    } else {
      console.log(`✅ Bulk indexed ${documents.length} documents to ${index}`)
    }

    return bulkResponse
  } catch (error) {
    console.error(`❌ Error bulk indexing to ${index}:`, error)
    throw error
  }
}

// Advanced search with filters, sorting, and pagination
export async function searchCars(params: {
  query?: string
  brands?: string[]
  bodyTypes?: string[]
  fuelTypes?: string[]
  transmissions?: string[]
  priceMin?: number
  priceMax?: number
  seatingCapacity?: number[]
  isNew?: boolean
  isPopular?: boolean
  sortBy?: 'price' | 'popularity' | 'rating' | 'name' | 'launchDate'
  sortOrder?: 'asc' | 'desc'
  page?: number
  size?: number
}) {
  const {
    query = '',
    brands = [],
    bodyTypes = [],
    fuelTypes = [],
    transmissions = [],
    priceMin,
    priceMax,
    seatingCapacity = [],
    isNew,
    isPopular,
    sortBy = 'popularity',
    sortOrder = 'desc',
    page = 1,
    size = 20
  } = params

  const must: any[] = []
  const filter: any[] = []

  // Text search with multi-match
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['name^3', 'brandName^2', 'description', 'bodyType'],
        type: 'best_fields',
        fuzziness: 'AUTO',
        prefix_length: 2
      }
    })
  }

  // Filters
  if (brands.length > 0) {
    filter.push({ terms: { 'brandName.keyword': brands } })
  }

  if (bodyTypes.length > 0) {
    filter.push({ terms: { bodyType: bodyTypes } })
  }

  if (fuelTypes.length > 0) {
    filter.push({ terms: { fuelTypes: fuelTypes } })
  }

  if (transmissions.length > 0) {
    filter.push({ terms: { transmissions: transmissions } })
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    filter.push({
      range: {
        price: {
          ...(priceMin !== undefined && { gte: priceMin }),
          ...(priceMax !== undefined && { lte: priceMax })
        }
      }
    })
  }

  if (seatingCapacity.length > 0) {
    filter.push({ terms: { seatingCapacity } })
  }

  if (isNew !== undefined) {
    filter.push({ term: { isNew } })
  }

  if (isPopular !== undefined) {
    filter.push({ term: { isPopular } })
  }

  // Sorting
  const sort: any[] = []
  switch (sortBy) {
    case 'price':
      sort.push({ price: { order: sortOrder } })
      break
    case 'popularity':
      sort.push({ reviewCount: { order: sortOrder } })
      break
    case 'rating':
      sort.push({ rating: { order: sortOrder } })
      break
    case 'name':
      sort.push({ 'name.keyword': { order: sortOrder } })
      break
    case 'launchDate':
      sort.push({ launchDate: { order: sortOrder } })
      break
    default:
      sort.push({ _score: { order: 'desc' } })
  }

  try {
    const { body } = await esClient.search({
      index: INDICES.MODELS,
      body: {
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter
          }
        },
        sort,
        from: (page - 1) * size,
        size,
        track_total_hits: true
      }
    })

    return {
      hits: body.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source
      })),
      total: body.hits.total.value,
      page,
      size,
      totalPages: Math.ceil(body.hits.total.value / size)
    }
  } catch (error) {
    console.error('❌ Elasticsearch search error:', error)
    throw error
  }
}

// Autocomplete suggestions
export async function getAutocompleteSuggestions(query: string, size: number = 10) {
  try {
    const { body } = await esClient.search({
      index: INDICES.MODELS,
      body: {
        suggest: {
          model_suggest: {
            prefix: query,
            completion: {
              field: 'name.suggest',
              size,
              skip_duplicates: true,
              fuzzy: {
                fuzziness: 'AUTO'
              }
            }
          }
        }
      }
    })

    return body.suggest.model_suggest[0].options.map((option: any) => ({
      text: option.text,
      score: option._score,
      source: option._source
    }))
  } catch (error) {
    console.error('❌ Autocomplete error:', error)
    return []
  }
}

// Aggregations for faceted search
export async function getSearchFacets() {
  try {
    const { body } = await esClient.search({
      index: INDICES.MODELS,
      body: {
        size: 0,
        aggs: {
          brands: {
            terms: { field: 'brandName.keyword', size: 50 }
          },
          bodyTypes: {
            terms: { field: 'bodyType', size: 20 }
          },
          fuelTypes: {
            terms: { field: 'fuelTypes', size: 10 }
          },
          transmissions: {
            terms: { field: 'transmissions', size: 10 }
          },
          priceRanges: {
            range: {
              field: 'price',
              ranges: [
                { key: 'under_8', to: 800000 },
                { key: '8_to_15', from: 800000, to: 1500000 },
                { key: '15_to_25', from: 1500000, to: 2500000 },
                { key: '25_to_50', from: 2500000, to: 5000000 },
                { key: 'above_50', from: 5000000 }
              ]
            }
          },
          seatingCapacity: {
            terms: { field: 'seatingCapacity', size: 10 }
          }
        }
      }
    })

    return {
      brands: body.aggregations.brands.buckets,
      bodyTypes: body.aggregations.bodyTypes.buckets,
      fuelTypes: body.aggregations.fuelTypes.buckets,
      transmissions: body.aggregations.transmissions.buckets,
      priceRanges: body.aggregations.priceRanges.buckets,
      seatingCapacity: body.aggregations.seatingCapacity.buckets
    }
  } catch (error) {
    console.error('❌ Facets error:', error)
    return null
  }
}

// Delete document
export async function deleteDocument(index: string, id: string) {
  try {
    await esClient.delete({
      index,
      id,
      refresh: 'wait_for'
    })
  } catch (error) {
    console.error(`❌ Error deleting document from ${index}:`, error)
    throw error
  }
}

// Update document
export async function updateDocument(index: string, id: string, updates: any) {
  try {
    await esClient.update({
      index,
      id,
      body: {
        doc: updates
      },
      refresh: 'wait_for'
    })
  } catch (error) {
    console.error(`❌ Error updating document in ${index}:`, error)
    throw error
  }
}

// Sync MongoDB to Elasticsearch
export async function syncMongoToElasticsearch(Model: any, index: string) {
  try {
    const documents = await Model.find({}).lean()
    await bulkIndexDocuments(index, documents)
    console.log(`✅ Synced ${documents.length} documents from MongoDB to ${index}`)
  } catch (error) {
    console.error('❌ Sync error:', error)
    throw error
  }
}

export default esClient
