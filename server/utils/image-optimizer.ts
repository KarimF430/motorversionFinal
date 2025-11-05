import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Optimize an image file
 */
export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: ImageOptimizationOptions = {}
): Promise<{ success: boolean; size: number; originalSize: number }> {
  try {
    const { width, height, quality = 85, format = 'webp', fit = 'inside' } = options;

    // Get original file size
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;

    // Create sharp instance
    let image = sharp(inputPath);

    // Resize if dimensions provided
    if (width || height) {
      image = image.resize(width, height, {
        fit,
        withoutEnlargement: true,
      });
    }

    // Convert to specified format with quality
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        image = image.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
    }

    // Save optimized image
    await image.toFile(outputPath);

    // Get optimized file size
    const optimizedStats = await fs.stat(outputPath);
    const optimizedSize = optimizedStats.size;

    const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(2);
    console.log(
      `✅ Image optimized: ${originalSize} → ${optimizedSize} bytes (${savings}% reduction)`
    );

    return {
      success: true,
      size: optimizedSize,
      originalSize,
    };
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    return {
      success: false,
      size: 0,
      originalSize: 0,
    };
  }
}

/**
 * Create multiple sizes of an image (responsive images)
 */
export async function createResponsiveImages(
  inputPath: string,
  outputDir: string,
  basename: string
): Promise<{ [size: string]: string }> {
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
    xlarge: { width: 1920, height: 1080 },
  };

  const results: { [size: string]: string } = {};

  for (const [sizeName, dimensions] of Object.entries(sizes)) {
    const outputPath = path.join(outputDir, `${basename}-${sizeName}.webp`);

    await optimizeImage(inputPath, outputPath, {
      width: dimensions.width,
      height: dimensions.height,
      format: 'webp',
      quality: 85,
      fit: 'inside',
    });

    results[sizeName] = outputPath;
  }

  return results;
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imagePath: string) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
    };
  } catch (error) {
    console.error('❌ Failed to get image metadata:', error);
    return null;
  }
}

/**
 * Compress image in place
 */
export async function compressImage(imagePath: string, quality: number = 85): Promise<boolean> {
  try {
    const tempPath = `${imagePath}.tmp`;

    await sharp(imagePath).webp({ quality }).toFile(tempPath);

    // Replace original with compressed version
    await fs.unlink(imagePath);
    await fs.rename(tempPath, imagePath);

    console.log(`✅ Image compressed: ${imagePath}`);
    return true;
  } catch (error) {
    console.error('❌ Image compression failed:', error);
    return false;
  }
}

/**
 * Batch optimize images in a directory
 */
export async function batchOptimizeImages(
  inputDir: string,
  outputDir: string,
  options: ImageOptimizationOptions = {}
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  try {
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

    console.log(`📦 Optimizing ${imageFiles.length} images...`);

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file.replace(/\.[^.]+$/, '.webp'));

      const result = await optimizeImage(inputPath, outputPath, options);

      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`✅ Batch optimization complete: ${success} success, ${failed} failed`);
  } catch (error) {
    console.error('❌ Batch optimization failed:', error);
  }

  return { success, failed };
}
