import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Brand, Model, Variant, AdminUser, PopularComparison } from './server/db/schemas';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrate() {
  try {
    console.log('🚀 Starting MongoDB migration...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/motoroctane';
    console.log(`📡 Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Read JSON files
    const dataDir = path.join(process.cwd(), 'data');
    console.log(`📁 Reading data from: ${dataDir}\n`);

    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
      console.log('⚠️  Data directory not found. Creating empty collections...');
      await Promise.all([
        Brand.deleteMany({}),
        Model.deleteMany({}),
        Variant.deleteMany({}),
        AdminUser.deleteMany({}),
        PopularComparison.deleteMany({})
      ]);
      console.log('✅ Empty collections created');
      console.log('\n🎉 Migration completed (no data to migrate)');
      process.exit(0);
    }

    // Read data files
    const brandsFile = path.join(dataDir, 'brands.json');
    const modelsFile = path.join(dataDir, 'models.json');
    const variantsFile = path.join(dataDir, 'variants.json');
    const adminUsersFile = path.join(dataDir, 'admin-users.json');
    const comparisonsFile = path.join(dataDir, 'popular-comparisons.json');

    let brands: any[] = [];
    let models: any[] = [];
    let variants: any[] = [];
    let adminUsers: any[] = [];
    let comparisons: any[] = [];

    // Read brands
    if (fs.existsSync(brandsFile)) {
      const brandsData = fs.readFileSync(brandsFile, 'utf-8');
      brands = JSON.parse(brandsData);
      console.log(`📦 Found ${brands.length} brands`);
    }

    // Read models
    if (fs.existsSync(modelsFile)) {
      const modelsData = fs.readFileSync(modelsFile, 'utf-8');
      models = JSON.parse(modelsData);
      console.log(`📦 Found ${models.length} models`);
    }

    // Read variants
    if (fs.existsSync(variantsFile)) {
      const variantsData = fs.readFileSync(variantsFile, 'utf-8');
      variants = JSON.parse(variantsData);
      console.log(`📦 Found ${variants.length} variants`);
    }

    // Read admin users
    if (fs.existsSync(adminUsersFile)) {
      const adminUsersData = fs.readFileSync(adminUsersFile, 'utf-8');
      adminUsers = JSON.parse(adminUsersData);
      console.log(`📦 Found ${adminUsers.length} admin users`);
    }

    // Read popular comparisons
    if (fs.existsSync(comparisonsFile)) {
      const comparisonsData = fs.readFileSync(comparisonsFile, 'utf-8');
      comparisons = JSON.parse(comparisonsData);
      console.log(`📦 Found ${comparisons.length} popular comparisons`);
    }

    console.log('\n🗑️  Clearing existing MongoDB data...');
    // Clear existing data
    await Promise.all([
      Brand.deleteMany({}),
      Model.deleteMany({}),
      Variant.deleteMany({}),
      AdminUser.deleteMany({}),
      PopularComparison.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');

    // Insert data
    console.log('📥 Inserting data into MongoDB...\n');

    if (brands.length > 0) {
      await Brand.insertMany(brands);
      console.log(`✅ Migrated ${brands.length} brands`);
    }

    if (models.length > 0) {
      await Model.insertMany(models);
      console.log(`✅ Migrated ${models.length} models`);
    }

    if (variants.length > 0) {
      await Variant.insertMany(variants);
      console.log(`✅ Migrated ${variants.length} variants`);
    }

    if (adminUsers.length > 0) {
      await AdminUser.insertMany(adminUsers);
      console.log(`✅ Migrated ${adminUsers.length} admin users`);
    }

    if (comparisons.length > 0) {
      await PopularComparison.insertMany(comparisons);
      console.log(`✅ Migrated ${comparisons.length} popular comparisons`);
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const [brandCount, modelCount, variantCount, userCount, comparisonCount] = await Promise.all([
      Brand.countDocuments(),
      Model.countDocuments(),
      Variant.countDocuments(),
      AdminUser.countDocuments(),
      PopularComparison.countDocuments()
    ]);

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Brands:              ${brandCount}`);
    console.log(`   Models:              ${modelCount}`);
    console.log(`   Variants:            ${variantCount}`);
    console.log(`   Admin Users:         ${userCount}`);
    console.log(`   Popular Comparisons: ${comparisonCount}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Backup your JSON files (they are still intact)');
    console.log('   2. Start the server: npm run dev');
    console.log('   3. Test all API endpoints');
    console.log('   4. Monitor MongoDB performance\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MongoDB is running');
    console.error('   2. Check MONGODB_URI in .env file');
    console.error('   3. Verify JSON files exist in data/ directory');
    console.error('   4. Check MongoDB connection string\n');
    process.exit(1);
  }
}

// Run migration
migrate();
