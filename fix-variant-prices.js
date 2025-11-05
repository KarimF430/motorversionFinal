// Fix Variant Prices to be more realistic
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/motoroctane';

// Price ranges for different budget categories
const budgetRanges = [
  { name: 'Budget', min: 500000, max: 1000000, count: 200 }, // 5L - 10L
  { name: 'Mid-Range', min: 1000000, max: 2000000, count: 250 }, // 10L - 20L
  { name: 'Premium', min: 2000000, max: 4000000, count: 200 }, // 20L - 40L
  { name: 'Luxury', min: 4000000, max: 10000000, count: 150 }, // 40L - 1Cr
  { name: 'Ultra-Luxury', min: 10000000, max: 20000000, count: 35 }, // 1Cr - 2Cr
];

function generatePrice(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

async function fixPrices() {
  console.log('🔧 Fixing variant prices...');
  console.log('================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const variantsCollection = db.collection('variants');

    // Get all variants
    const allVariants = await variantsCollection.find({}).toArray();
    console.log(`📊 Found ${allVariants.length} variants\n`);

    let updated = 0;
    let variantIndex = 0;

    // Distribute variants across budget ranges
    for (const range of budgetRanges) {
      console.log(
        `💰 Processing ${range.name} (₹${range.min / 100000}L - ₹${range.max / 100000}L)...`
      );

      const variantsToUpdate = allVariants.slice(variantIndex, variantIndex + range.count);

      for (const variant of variantsToUpdate) {
        const newPrice = generatePrice(range.min, range.max);

        await variantsCollection.updateOne({ _id: variant._id }, { $set: { price: newPrice } });

        updated++;
      }

      console.log(`  ✅ Updated ${variantsToUpdate.length} variants`);
      variantIndex += range.count;
    }

    console.log(`\n✅ Updated ${updated} variant prices\n`);

    // Verify the distribution
    const verification = await variantsCollection.find({}).toArray();
    const prices = verification.map((v) => v.price).filter((p) => p > 0);

    console.log('================================');
    console.log('📊 PRICE DISTRIBUTION:');
    console.log('================================\n');
    console.log(`Total variants: ${prices.length}`);
    console.log(`Min price: ₹${(Math.min(...prices) / 100000).toFixed(2)}L`);
    console.log(`Max price: ₹${(Math.max(...prices) / 100000).toFixed(2)}L`);
    console.log('');
    console.log('By Budget:');
    console.log(`  Under ₹8L:    ${prices.filter((p) => p <= 800000).length} variants`);
    console.log(
      `  ₹8L - ₹15L:   ${prices.filter((p) => p > 800000 && p <= 1500000).length} variants`
    );
    console.log(
      `  ₹15L - ₹25L:  ${prices.filter((p) => p > 1500000 && p <= 2500000).length} variants`
    );
    console.log(
      `  ₹25L - ₹50L:  ${prices.filter((p) => p > 2500000 && p <= 5000000).length} variants`
    );
    console.log(`  Above ₹50L:   ${prices.filter((p) => p > 5000000).length} variants`);
    console.log('');
    console.log('✅ Prices fixed successfully!');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ Database connection closed');
  }
}

// Run the script
fixPrices().catch(console.error);
