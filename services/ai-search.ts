import Groq from 'groq-sdk'

/**
 * AI-Powered Car Search Service
 * Uses Groq AI (Llama 3) for natural language understanding
 */

// Check if API key is configured
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 20) {
  console.warn('⚠️  WARNING: Groq API key not configured properly!')
  console.warn('   Get your free API key from: https://console.groq.com')
  console.warn('   Add it to backend/.env as: GROQ_API_KEY=your_key_here')
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

interface CarQuery {
  budget?: { min: number; max: number }
  bodyType?: string[]
  fuelType?: string[]
  transmission?: string[]
  seating?: number
  features?: string[]
  brand?: string[]
  mileage?: { min: number }
  segment?: string
  sortBy?: 'price' | 'mileage' | 'popularity'
}

interface AISearchResult {
  query: CarQuery
  explanation: string
  confidence: number
  suggestions: string[]
}

/**
 * Parse natural language query into structured filters
 */
export async function parseNaturalLanguageQuery(userQuery: string): Promise<AISearchResult> {
  try {
    console.log('🧠 Using Groq AI (Llama 3) to parse query...')

    const prompt = `
You are a car recommendation expert for the Indian market. Parse this user query into structured filters with HIGH ACCURACY.

User Query: "${userQuery}"

IMPORTANT TRANSMISSION TYPES (be precise):
- Manual: Manual gearbox
- Automatic: Traditional automatic
- AMT: Automated Manual Transmission
- CVT: Continuously Variable Transmission
- DCT: Dual Clutch Transmission (also called DSG)
- iMT: Intelligent Manual Transmission

IMPORTANT FEATURES (extract exactly):
- Dual Zone AC / Dual Zone Climate Control
- Sunroof / Panoramic Sunroof
- Leather Seats
- Touchscreen / Infotainment
- Wireless Charging
- Ventilated Seats
- 360 Camera
- ADAS / Advanced Safety
- Cruise Control
- Keyless Entry
- Push Button Start

BODY TYPES: Hatchback, Sedan, SUV, MUV, Coupe, Convertible
FUEL TYPES: Petrol, Diesel, Electric, CNG, Hybrid
BRANDS: Maruti Suzuki, Hyundai, Tata, Mahindra, Kia, Honda, Toyota, Volkswagen, Skoda, etc.

BUDGET: Convert "X lakhs" to rupees (X * 100000)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "query": {
    "budget": { "min": number, "max": number },
    "bodyType": ["exact type"],
    "fuelType": ["exact type"],
    "transmission": ["exact type - be precise!"],
    "seating": number,
    "features": ["exact feature names"],
    "brand": ["brand name"],
    "sortBy": "price" | "mileage" | "popularity"
  },
  "explanation": "Clear explanation of user's requirements",
  "confidence": 0.0 to 1.0
}

EXAMPLES:
Query: "cars with dual zone DCT under 10 lakhs"
{"query":{"budget":{"min":0,"max":1000000},"transmission":["DCT"],"features":["Dual Zone AC"]},"explanation":"Looking for cars with Dual Zone AC and DCT transmission under 10 lakhs","confidence":0.95}

Query: "SUV with sunroof and automatic under 15 lakhs"
{"query":{"budget":{"min":0,"max":1500000},"bodyType":["SUV"],"transmission":["Automatic","CVT","DCT"],"features":["Sunroof"]},"explanation":"Looking for automatic SUVs with sunroof under 15 lakhs","confidence":0.9}

Query: "family car with 7 seats"
{"query":{"seating":7,"bodyType":["SUV","MUV"]},"explanation":"Looking for 7-seater family vehicles","confidence":0.85}

Now parse: "${userQuery}"
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
    })

    const response = completion.choices[0]?.message?.content || ''
    
    console.log('✅ Groq AI response received')
    console.log('📝 Raw response:', response.substring(0, 200))
    
    // Clean response (remove markdown if present)
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '')
    }
    
    const parsed = JSON.parse(cleanResponse)
    
    console.log('✅ Groq AI parsed successfully:', JSON.stringify(parsed.query))
    
    return parsed as AISearchResult
  } catch (error) {
    console.error('❌ Groq AI parsing error:', error)
    console.log('⚠️  Falling back to keyword matching...')
    
    // Fallback: Basic keyword matching
    return fallbackParser(userQuery)
  }
}

/**
 * Fallback parser using keyword matching
 */
function fallbackParser(query: string): AISearchResult {
  console.log('🔄 Using fallback keyword parser (Groq failed)')
  const lowerQuery = query.toLowerCase()
  const result: AISearchResult = {
    query: {},
    explanation: 'Searching based on keywords',
    confidence: 0.6,
    suggestions: []
  }

  // Budget extraction
  const budgetMatch = lowerQuery.match(/(\d+)\s*(lakh|lakhs|l)/i)
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1]) * 100000
    result.query.budget = { min: 0, max: amount }
  }

  // Body type
  if (lowerQuery.includes('suv')) result.query.bodyType = ['SUV']
  if (lowerQuery.includes('sedan')) result.query.bodyType = ['Sedan']
  if (lowerQuery.includes('hatchback')) result.query.bodyType = ['Hatchback']
  if (lowerQuery.includes('muv') || lowerQuery.includes('family')) {
    result.query.bodyType = ['MUV', 'SUV']
    result.query.seating = 7
  }

  // Fuel type
  if (lowerQuery.includes('electric') || lowerQuery.includes('ev')) {
    result.query.fuelType = ['Electric']
  }
  if (lowerQuery.includes('diesel')) result.query.fuelType = ['Diesel']
  if (lowerQuery.includes('petrol')) result.query.fuelType = ['Petrol']
  if (lowerQuery.includes('cng')) result.query.fuelType = ['CNG']

  // Transmission (be specific)
  if (lowerQuery.includes('dct') || lowerQuery.includes('dual clutch')) {
    result.query.transmission = ['DCT']
  } else if (lowerQuery.includes('cvt')) {
    result.query.transmission = ['CVT']
  } else if (lowerQuery.includes('amt')) {
    result.query.transmission = ['AMT']
  } else if (lowerQuery.includes('automatic') || lowerQuery.includes('auto')) {
    result.query.transmission = ['Automatic', 'AMT', 'CVT', 'DCT']
  } else if (lowerQuery.includes('manual')) {
    result.query.transmission = ['Manual']
  }

  // Features
  const features = []
  if (lowerQuery.includes('dual zone') || lowerQuery.includes('dual-zone')) {
    features.push('Dual Zone AC')
  }
  if (lowerQuery.includes('sunroof') || lowerQuery.includes('panoramic')) {
    features.push('Sunroof')
  }
  if (lowerQuery.includes('ventilated seat')) features.push('Ventilated Seats')
  if (lowerQuery.includes('wireless charging')) features.push('Wireless Charging')
  if (lowerQuery.includes('360 camera')) features.push('360 Camera')
  if (lowerQuery.includes('adas') || lowerQuery.includes('advanced safety')) {
    features.push('ADAS')
  }
  if (lowerQuery.includes('cruise control')) features.push('Cruise Control')
  
  if (features.length > 0) result.query.features = features

  // Sorting
  if (lowerQuery.includes('mileage') || lowerQuery.includes('fuel efficient')) {
    result.query.sortBy = 'mileage'
  } else if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
    result.query.sortBy = 'price'
  }

  return result
}

/**
 * Generate car recommendations based on AI analysis
 */
export async function generateRecommendations(
  userQuery: string,
  availableCars: any[]
): Promise<{
  recommendations: any[]
  explanation: string
  alternatives: any[]
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Get top 10 cars from filtered results
    const topCars = availableCars.slice(0, 10)

    const prompt = `
You are a car recommendation expert. Based on the user's query and available cars, recommend the best options.

User Query: "${userQuery}"

Available Cars:
${topCars.map((car, i) => `
${i + 1}. ${car.brand} ${car.name}
   - Price: ₹${(car.startingPrice / 100000).toFixed(2)}L
   - Body Type: ${car.bodyType}
   - Fuel: ${car.fuelTypes?.join(', ')}
   - Mileage: ${car.mileage || 'N/A'} km/l
   - Seating: ${car.seating}
   - Key Features: ${car.keyFeatures?.slice(0, 3).join(', ') || 'N/A'}
`).join('\n')}

Provide recommendations in JSON format:
{
  "recommendations": [1, 3, 5], // Array of car numbers (max 5)
  "explanation": "Why these cars are recommended",
  "alternatives": [2, 4] // Alternative options (max 3)
}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    
    const parsed = JSON.parse(cleanResponse)
    
    return {
      recommendations: parsed.recommendations.map((i: number) => topCars[i - 1]).filter(Boolean),
      explanation: parsed.explanation,
      alternatives: parsed.alternatives.map((i: number) => topCars[i - 1]).filter(Boolean)
    }
  } catch (error) {
    console.error('Recommendation generation error:', error)
    
    // Fallback: Return top 5 cars
    return {
      recommendations: availableCars.slice(0, 5),
      explanation: 'Top matching cars based on your criteria',
      alternatives: availableCars.slice(5, 8)
    }
  }
}

/**
 * Generate comparison between two cars
 */
export async function generateComparison(car1: any, car2: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Compare these two cars and provide a detailed analysis:

Car 1: ${car1.brand} ${car1.name}
- Price: ₹${(car1.startingPrice / 100000).toFixed(2)}L
- Body Type: ${car1.bodyType}
- Fuel: ${car1.fuelTypes?.join(', ')}
- Mileage: ${car1.mileage || 'N/A'} km/l
- Engine: ${car1.engineCC || 'N/A'} cc
- Power: ${car1.power || 'N/A'} bhp
- Features: ${car1.keyFeatures?.join(', ') || 'N/A'}

Car 2: ${car2.brand} ${car2.name}
- Price: ₹${(car2.startingPrice / 100000).toFixed(2)}L
- Body Type: ${car2.bodyType}
- Fuel: ${car2.fuelTypes?.join(', ')}
- Mileage: ${car2.mileage || 'N/A'} km/l
- Engine: ${car2.engineCC || 'N/A'} cc
- Power: ${car2.power || 'N/A'} bhp
- Features: ${car2.keyFeatures?.join(', ') || 'N/A'}

Provide a comparison in this format:
- Key Differences
- Pros of Car 1
- Pros of Car 2
- Which one to choose and why
- Final verdict

Keep it concise and user-friendly.
`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Comparison generation error:', error)
    return 'Unable to generate comparison at this time.'
  }
}

/**
 * Generate conversational response
 */
export async function generateConversationalResponse(
  userMessage: string,
  context: any
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are a friendly car buying assistant. Respond to the user's message naturally.

Context: ${JSON.stringify(context)}
User Message: "${userMessage}"

Provide a helpful, conversational response. Be concise and friendly.
`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Conversational response error:', error)
    return 'I understand. Let me help you find the perfect car!'
  }
}
