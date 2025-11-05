// Direct Cloudinary Connection Test
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Cloudinary Connection...');
console.log('====================================');
console.log('');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('Configuration:');
console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`  API Key: ${process.env.CLOUDINARY_API_KEY}`);
console.log(
  `  API Secret: ${process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET'}`
);
console.log('');

// Test 1: Upload from URL
console.log('Test 1: Uploading test image from URL...');
cloudinary.uploader
  .upload('https://via.placeholder.com/150', {
    folder: 'motoroctane/test',
    public_id: `test-${Date.now()}`,
  })
  .then((result) => {
    console.log('✅ SUCCESS! Cloudinary is working!');
    console.log('');
    console.log('Upload Details:');
    console.log(`  URL: ${result.secure_url}`);
    console.log(`  Public ID: ${result.public_id}`);
    console.log(`  Format: ${result.format}`);
    console.log(`  Size: ${result.bytes} bytes`);
    console.log('');
    console.log('====================================');
    console.log('✅ CLOUDINARY IS FULLY FUNCTIONAL!');
    console.log('====================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED! Cloudinary connection error');
    console.error('');
    console.error('Error Details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  HTTP Code: ${error.http_code || 'N/A'}`);
    console.error('');
    console.error('Possible Issues:');
    console.error('  1. Invalid credentials (check .env file)');
    console.error('  2. Cloudinary account not active');
    console.error('  3. Network/firewall blocking API');
    console.error('  4. API key/secret incorrect');
    console.error('');
    console.error('====================================');
    console.error('❌ CLOUDINARY NOT WORKING');
    console.error('====================================');
    process.exit(1);
  });
