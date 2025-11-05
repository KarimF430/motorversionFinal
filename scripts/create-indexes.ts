import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Create optimized indexes for 1M+ users
 * Run this script once: tsx backend/scripts/create-indexes.ts
 */
async function createOptimizedIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db!

    // ============================================
    // MODELS COLLECTION INDEXES
    // ============================================
    console.log('\n📊 Creating indexes for models collection...')
    
    const modelsIndexes = [
      // Single field indexes
      { key: { brandId: 1 }, name: 'idx_brandId' },
      { key: { slug: 1 }, name: 'idx_slug', unique: true },
      { key: { price: 1 }, name: 'idx_price' },
      { key: { bodyType: 1 }, name: 'idx_bodyType' },
      { key: { isNew: 1 }, name: 'idx_isNew' },
      { key: { isPopular: 1 }, name: 'idx_isPopular' },
      { key: { launchDate: -1 }, name: 'idx_launchDate_desc' },
      { key: { createdAt: -1 }, name: 'idx_createdAt_desc' },
      
      // Compound indexes for common queries
      { key: { brandId: 1, price: 1 }, name: 'idx_brand_price' },
      { key: { bodyType: 1, price: 1 }, name: 'idx_bodyType_price' },
      { key: { fuelTypes: 1, price: 1 }, name: 'idx_fuel_price' },
      { key: { isNew: 1, launchDate: -1 }, name: 'idx_new_launch' },
      { key: { isPopular: 1, popularRank: 1 }, name: 'idx_popular_rank' },
      { key: { brandId: 1, bodyType: 1, price: 1 }, name: 'idx_brand_body_price' },
      
      // Text index for search
      { 
        key: { name: 'text', description: 'text' }, 
        name: 'idx_text_search',
        weights: { name: 10, description: 5 }
      }
    ]

    for (const index of modelsIndexes) {
      try {
        await db.collection('models').createIndex(index.key, {
          name: index.name,
          unique: (index as any).unique || false,
          background: true
        })
        console.log(`  ✅ Created: ${index.name}`)
      } catch (error: any) {
        if (error.code === 85 || error.code === 86) {
          console.log(`  ⚠️  Index already exists: ${index.name}`)
        } else {
          console.error(`  ❌ Error creating ${index.name}:`, error.message)
        }
      }
    }

    // ============================================
    // VARIANTS COLLECTION INDEXES
    // ============================================
    console.log('\n📊 Creating indexes for variants collection...')
    
    const variantsIndexes = [
      { key: { modelId: 1 }, name: 'idx_modelId' },
      { key: { price: 1 }, name: 'idx_price' },
      { key: { fuelType: 1 }, name: 'idx_fuelType' },
      { key: { transmission: 1 }, name: 'idx_transmission' },
      { key: { isValueForMoney: 1 }, name: 'idx_valueForMoney' },
      
      // Compound indexes
      { key: { modelId: 1, price: 1 }, name: 'idx_model_price' },
      { key: { modelId: 1, fuelType: 1 }, name: 'idx_model_fuel' },
      { key: { fuelType: 1, transmission: 1, price: 1 }, name: 'idx_fuel_trans_price' }
    ]

    for (const index of variantsIndexes) {
      try {
        await db.collection('variants').createIndex(index.key, {
          name: index.name,
          background: true
        })
        console.log(`  ✅ Created: ${index.name}`)
      } catch (error: any) {
        if (error.code === 85 || error.code === 86) {
          console.log(`  ⚠️  Index already exists: ${index.name}`)
        } else {
          console.error(`  ❌ Error creating ${index.name}:`, error.message)
        }
      }
    }

    // ============================================
    // BRANDS COLLECTION INDEXES
    // ============================================
    console.log('\n📊 Creating indexes for brands collection...')
    
    const brandsIndexes = [
      { key: { name: 1 }, name: 'idx_name', unique: true },
      { key: { slug: 1 }, name: 'idx_slug', unique: true },
      { key: { popularity: -1 }, name: 'idx_popularity_desc' }
    ]

    for (const index of brandsIndexes) {
      try {
        await db.collection('brands').createIndex(index.key, {
          name: index.name,
          unique: (index as any).unique || false,
          background: true
        })
        console.log(`  ✅ Created: ${index.name}`)
      } catch (error: any) {
        if (error.code === 85 || error.code === 86) {
          console.log(`  ⚠️  Index already exists: ${index.name}`)
        } else {
          console.error(`  ❌ Error creating ${index.name}:`, error.message)
        }
      }
    }

    // ============================================
    // VERIFY INDEXES
    // ============================================
    console.log('\n📋 Verifying indexes...')
    
    const modelsIndexList = await db.collection('models').indexes()
    const variantsIndexList = await db.collection('variants').indexes()
    const brandsIndexList = await db.collection('brands').indexes()
    
    console.log(`\n  Models: ${modelsIndexList.length} indexes`)
    console.log(`  Variants: ${variantsIndexList.length} indexes`)
    console.log(`  Brands: ${brandsIndexList.length} indexes`)

    // ============================================
    // INDEX STATISTICS
    // ============================================
    console.log('\n📊 Index Statistics:')
    
    const modelsStats = await db.collection('models').stats()
    const variantsStats = await db.collection('variants').stats()
    const brandsStats = await db.collection('brands').stats()
    
    console.log(`\n  Models Collection:`)
    console.log(`    Documents: ${modelsStats.count}`)
    console.log(`    Total Size: ${(modelsStats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`    Index Size: ${(modelsStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`)
    
    console.log(`\n  Variants Collection:`)
    console.log(`    Documents: ${variantsStats.count}`)
    console.log(`    Total Size: ${(variantsStats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`    Index Size: ${(variantsStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`)
    
    console.log(`\n  Brands Collection:`)
    console.log(`    Documents: ${brandsStats.count}`)
    console.log(`    Total Size: ${(brandsStats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`    Index Size: ${(brandsStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`)

    console.log('\n✅ All indexes created successfully!')
    console.log('\n💡 Tips:')
    console.log('  - Monitor index usage with db.collection.aggregate([{$indexStats:{}}])')
    console.log('  - Drop unused indexes to save space')
    console.log('  - Re-run this script after schema changes')

  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
createOptimizedIndexes()
