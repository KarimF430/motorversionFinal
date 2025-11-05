// Generate Sample Data for MotorOctane
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/motoroctane';

// Sample brand names (10 new brands)
const newBrands = [
  { name: 'Volkswagen', logo: '/uploads/logo-placeholder.png' },
  { name: 'Toyota', logo: '/uploads/logo-placeholder.png' },
  { name: 'Nissan', logo: '/uploads/logo-placeholder.png' },
  { name: 'Ford', logo: '/uploads/logo-placeholder.png' },
  { name: 'Renault', logo: '/uploads/logo-placeholder.png' },
  { name: 'Skoda', logo: '/uploads/logo-placeholder.png' },
  { name: 'MG', logo: '/uploads/logo-placeholder.png' },
  { name: 'Jeep', logo: '/uploads/logo-placeholder.png' },
  { name: 'Citroen', logo: '/uploads/logo-placeholder.png' },
  { name: 'BYD', logo: '/uploads/logo-placeholder.png' },
];

// Model name templates
const modelPrefixes = ['City', 'Elite', 'Prime', 'Royal', 'Grand', 'Super', 'Ultra', 'Mega'];
const modelSuffixes = ['Pro', 'Plus', 'Max', 'Sport', 'Luxury', 'Premium', 'Executive', 'Deluxe'];
const modelTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Crossover'];

// Variant name templates
const variantPrefixes = ['Base', 'Mid', 'Top', 'Premium', 'Luxury'];
const variantSuffixes = ['', 'Plus', 'Pro', 'Max', 'Elite'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['Manual', 'Automatic', 'CVT', 'DCT'];

// Generate random ID
function generateId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Generate random price between min and max
function generatePrice(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

// Generate brand summary
function generateBrandSummary(brandName) {
  return `${brandName} is a leading automobile manufacturer offering a wide range of vehicles in India. The brand is known for its quality, performance, and innovative technology. ${brandName} has a strong presence in the Indian market with multiple models across different segments.

Start of operations in India:
${brandName} entered the Indian market with a vision to provide world-class vehicles to Indian customers. The brand has established manufacturing facilities and a strong dealer network across the country.

Market Share:
${brandName} has been steadily growing its market share in India, competing in various segments including sedans, SUVs, and hatchbacks. The brand focuses on delivering value, quality, and performance to its customers.

Key Aspects:
${brandName}'s USP lies in its commitment to innovation, safety, and customer satisfaction. The brand offers vehicles with advanced features, efficient engines, and modern design.

Competitors:
${brandName} competes with major players like Maruti Suzuki, Hyundai, Tata Motors, Honda, Kia, and Mahindra in the Indian automotive market.`;
}

// Generate brand FAQs
function generateBrandFAQs(brandName) {
  return [
    {
      question: `Q: What are the popular ${brandName} cars in India?`,
      answer: `${brandName} offers several popular models in India across different segments including sedans, SUVs, and hatchbacks.`,
    },
    {
      question: `Q: What is the price range of ${brandName} cars?`,
      answer: `${brandName} cars are available in a wide price range from ₹8 Lakh to ₹2 Crore, catering to different customer segments.`,
    },
    {
      question: `Q: Does ${brandName} offer electric vehicles?`,
      answer: `Yes, ${brandName} has electric and hybrid options in its portfolio for environmentally conscious customers.`,
    },
  ];
}

// Generate model name
function generateModelName(index) {
  const prefix = modelPrefixes[index % modelPrefixes.length];
  const suffix = modelSuffixes[Math.floor(index / modelPrefixes.length) % modelSuffixes.length];
  const type = modelTypes[index % modelTypes.length];
  return `${prefix} ${suffix} ${type}`;
}

// Generate variant name
function generateVariantName(modelName, index) {
  const prefix = variantPrefixes[index % variantPrefixes.length];
  const suffix =
    variantSuffixes[Math.floor(index / variantPrefixes.length) % variantSuffixes.length];
  const fuel = fuelTypes[index % fuelTypes.length];
  const transmission = transmissions[Math.floor(index / fuelTypes.length) % transmissions.length];

  return `${prefix}${suffix ? ' ' + suffix : ''} ${fuel} ${transmission}`;
}

async function generateData() {
  console.log('🚀 Starting data generation...');
  console.log('================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const brandsCollection = db.collection('brands');
    const modelsCollection = db.collection('models');
    const variantsCollection = db.collection('variants');

    // Get existing brands count for ranking
    const existingBrandsCount = await brandsCollection.countDocuments();
    console.log(`📊 Existing brands: ${existingBrandsCount}`);

    // Get existing images from models
    const existingModels = await modelsCollection.find({}).limit(2).toArray();
    const sampleImages = existingModels.map((m) => m.images || {});
    console.log(`📸 Found ${sampleImages.length} sample image sets\n`);

    // Generate 10 new brands
    console.log('📦 Generating 10 new brands...');
    const createdBrands = [];

    for (let i = 0; i < newBrands.length; i++) {
      const brandData = {
        id: generateId(),
        name: newBrands[i].name,
        logo: newBrands[i].logo,
        ranking: existingBrandsCount + i + 1,
        status: 'active',
        summary: generateBrandSummary(newBrands[i].name),
        faqs: generateBrandFAQs(newBrands[i].name),
        createdAt: new Date(),
      };

      const result = await brandsCollection.insertOne(brandData);
      createdBrands.push({ ...brandData, _id: result.insertedId });
      console.log(`  ✅ Created: ${brandData.name} (ID: ${brandData.id})`);
    }

    console.log(`\n✅ Created ${createdBrands.length} brands\n`);

    // Get all brands for model generation
    const allBrands = await brandsCollection.find({ status: 'active' }).toArray();
    console.log(`📊 Total active brands: ${allBrands.length}\n`);

    // Generate 40 models (distributed across all brands)
    console.log('🚗 Generating 40 models...');
    const createdModels = [];
    const modelsPerBrand = Math.ceil(40 / allBrands.length);

    let modelIndex = 0;
    for (const brand of allBrands) {
      const modelsForThisBrand = Math.min(modelsPerBrand, 40 - modelIndex);

      for (let i = 0; i < modelsForThisBrand && modelIndex < 40; i++) {
        const modelName = generateModelName(modelIndex);
        const basePrice = generatePrice(800000, 20000000); // 8L to 2Cr

        // Use sample images cyclically
        const imageSet = sampleImages[modelIndex % sampleImages.length] || {};

        const modelData = {
          id: generateId(),
          brandId: brand.id,
          name: modelName,
          bodyType: modelTypes[modelIndex % modelTypes.length],
          fuelType: fuelTypes[modelIndex % fuelTypes.length].toLowerCase(),
          transmission: transmissions[modelIndex % transmissions.length].toLowerCase(),
          seatingCapacity: [5, 7][modelIndex % 2],
          priceRange: `₹${(basePrice / 100000).toFixed(2)} - ${((basePrice * 1.5) / 100000).toFixed(2)} Lakh`,
          mileage: `${(15 + Math.random() * 10).toFixed(1)} kmpl`,
          engineCC: Math.floor(1000 + Math.random() * 2000),
          power: `${Math.floor(80 + Math.random() * 120)} bhp`,
          torque: `${Math.floor(120 + Math.random() * 200)} Nm`,
          images: imageSet,
          status: 'active',
          isPopular: modelIndex < 10, // First 10 are popular
          popularRank: modelIndex < 10 ? modelIndex + 1 : null,
          createdAt: new Date(),
        };

        const result = await modelsCollection.insertOne(modelData);
        createdModels.push({ ...modelData, _id: result.insertedId });
        console.log(`  ✅ ${brand.name} - ${modelName} (₹${(basePrice / 100000).toFixed(2)}L)`);
        modelIndex++;
      }
    }

    console.log(`\n✅ Created ${createdModels.length} models\n`);

    // Generate 20 variants per model (800 total)
    console.log('🎨 Generating variants (20 per model)...');
    let totalVariants = 0;

    for (const model of createdModels) {
      const basePrice =
        parseInt(model.priceRange.split('₹')[1].split(' ')[0].replace('.', '')) * 100000;

      for (let i = 0; i < 20; i++) {
        const variantName = generateVariantName(model.name, i);
        const variantPrice = generatePrice(basePrice, basePrice * 1.5);

        const variantData = {
          id: generateId(),
          modelId: model.id,
          name: variantName,
          price: variantPrice,
          fuelType: fuelTypes[i % fuelTypes.length].toLowerCase(),
          transmission:
            transmissions[Math.floor(i / fuelTypes.length) % transmissions.length].toLowerCase(),
          engineCC: model.engineCC,
          power: model.power,
          torque: model.torque,
          mileage: `${(15 + Math.random() * 10).toFixed(1)} kmpl`,
          seatingCapacity: model.seatingCapacity,
          bootSpace: `${Math.floor(300 + Math.random() * 200)} litres`,
          fuelTankCapacity: `${Math.floor(40 + Math.random() * 20)} litres`,
          groundClearance: `${Math.floor(160 + Math.random() * 50)} mm`,
          length: `${Math.floor(3800 + Math.random() * 800)} mm`,
          width: `${Math.floor(1700 + Math.random() * 200)} mm`,
          height: `${Math.floor(1500 + Math.random() * 300)} mm`,
          wheelbase: `${Math.floor(2400 + Math.random() * 400)} mm`,
          status: 'active',
          createdAt: new Date(),
        };

        await variantsCollection.insertOne(variantData);
        totalVariants++;

        if (totalVariants % 100 === 0) {
          console.log(`  ✅ Generated ${totalVariants} variants...`);
        }
      }
    }

    console.log(`\n✅ Created ${totalVariants} variants\n`);

    // Summary
    console.log('================================');
    console.log('✅ DATA GENERATION COMPLETE!');
    console.log('================================\n');
    console.log('📊 Summary:');
    console.log(`  • Brands created: ${createdBrands.length}`);
    console.log(`  • Models created: ${createdModels.length}`);
    console.log(`  • Variants created: ${totalVariants}`);
    console.log(`  • Total brands: ${await brandsCollection.countDocuments()}`);
    console.log(`  • Total models: ${await modelsCollection.countDocuments()}`);
    console.log(`  • Total variants: ${await variantsCollection.countDocuments()}`);
    console.log('');
    console.log('🎉 Your database is now populated with sample data!');
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
generateData().catch(console.error);
