export async function uploadImage(file: File): Promise<string | null> {
  if (!file) return null;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
}

export async function uploadMultipleImages(
  images: { file?: File; caption: string; previewUrl?: string }[]
): Promise<{ url: string; caption: string }[]> {
  console.log('🖼️ Uploading multiple images:', images.length, 'images');

  const uploadPromises = images.map(async (img, index) => {
    if (img.file) {
      console.log(`📤 Uploading NEW image ${index + 1}:`, img.file.name, 'Caption:', img.caption);
      const url = await uploadImage(img.file);
      if (url) {
        console.log(`✅ Image ${index + 1} uploaded successfully:`, url);
        return { url, caption: img.caption };
      } else {
        console.error(`❌ Failed to upload image ${index + 1}`);
        return null; // Return null for failed uploads
      }
    } else if (img.previewUrl && img.previewUrl.startsWith('/uploads/')) {
      // Keep existing uploaded images
      console.log(
        `💾 Keeping existing image ${index + 1}:`,
        img.previewUrl,
        'Caption:',
        img.caption
      );
      return { url: img.previewUrl, caption: img.caption };
    } else {
      console.log(`⏭️ Skipping empty image slot ${index + 1}`);
      return null; // Return null for empty slots
    }
  });

  const results = await Promise.all(uploadPromises);
  // Filter out null results (failed uploads or empty slots)
  const validResults = results.filter(
    (result): result is { url: string; caption: string } => result !== null
  );
  console.log('🎯 Upload results:', validResults.length, 'valid images out of', images.length);
  return validResults;
}
