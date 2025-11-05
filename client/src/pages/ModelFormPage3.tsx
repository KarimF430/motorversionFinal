import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useLocation, useParams } from "wouter";
import { useModelForm } from "@/contexts/ModelFormContext";
import { uploadImage, uploadMultipleImages } from "@/lib/imageUpload";
import { useToast } from "@/hooks/use-toast";

interface ImageData {
  id: string;
  caption: string;
  file?: File;
  previewUrl?: string;
}

export default function ModelFormPage3() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { formData, updateFormData } = useModelForm();
  
  const isEditMode = !!params.id;
  const modelId = params.id;
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize with proper ImageData structure
  const [heroImage, setHeroImage] = useState<ImageData>({
    id: 'hero',
    caption: typeof formData.heroImage === 'string' ? '' : ((formData.heroImage as any)?.caption || ''),
    previewUrl: typeof formData.heroImage === 'string' ? formData.heroImage : ''
  });
  
  const [galleryImages, setGalleryImages] = useState<ImageData[]>(() => {
    if (Array.isArray(formData.galleryImages) && formData.galleryImages.length > 0) {
      return (formData.galleryImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined // No file for existing images
      }));
    }
    return [{ id: '1', caption: '', previewUrl: '', file: undefined }, { id: '2', caption: '', previewUrl: '', file: undefined }];
  });
  
  const [keyFeatures, setKeyFeatures] = useState<ImageData[]>(() => {
    if (Array.isArray(formData.keyFeatureImages) && formData.keyFeatureImages.length > 0) {
      return (formData.keyFeatureImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      }));
    }
    return [{ id: '1', caption: '', previewUrl: '', file: undefined }];
  });
  
  const [spaceComfort, setSpaceComfort] = useState<ImageData[]>(() => {
    if (Array.isArray(formData.spaceComfortImages) && formData.spaceComfortImages.length > 0) {
      return (formData.spaceComfortImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      }));
    }
    return [{ id: '1', caption: '', previewUrl: '', file: undefined }];
  });
  
  const [storageConvenience, setStorageConvenience] = useState<ImageData[]>(() => {
    if (Array.isArray(formData.storageConvenienceImages) && formData.storageConvenienceImages.length > 0) {
      return (formData.storageConvenienceImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      }));
    }
    return [{ id: '1', caption: '', previewUrl: '', file: undefined }];
  });

  // Update image states when formData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && formData.heroImage) {
      setHeroImage({
        id: 'hero',
        caption: typeof formData.heroImage === 'string' ? '' : ((formData.heroImage as any)?.caption || ''),
        previewUrl: typeof formData.heroImage === 'string' ? formData.heroImage : ''
      });
    }

    if (isEditMode && Array.isArray(formData.galleryImages) && formData.galleryImages.length > 0) {
      setGalleryImages((formData.galleryImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      })));
    }

    if (isEditMode && Array.isArray(formData.keyFeatureImages) && formData.keyFeatureImages.length > 0) {
      setKeyFeatures((formData.keyFeatureImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      })));
    }

    if (isEditMode && Array.isArray(formData.spaceComfortImages) && formData.spaceComfortImages.length > 0) {
      setSpaceComfort((formData.spaceComfortImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      })));
    }

    if (isEditMode && Array.isArray(formData.storageConvenienceImages) && formData.storageConvenienceImages.length > 0) {
      setStorageConvenience((formData.storageConvenienceImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined
      })));
    }
  }, [isEditMode, formData.heroImage, formData.galleryImages, formData.keyFeatureImages, formData.spaceComfortImages, formData.storageConvenienceImages]);

  return (
    <div className="p-8">
      <div className="space-y-8 max-w-6xl">
        <h2 className="text-xl font-semibold">Page 3</h2>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Hero image and Gallery</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Hero image</Label>
              <ImageUpload 
                caption={heroImage.caption}
                onCaptionChange={(caption) => setHeroImage({ ...heroImage, caption })}
                onImageChange={(file, previewUrl) => {
                  setHeroImage({ ...heroImage, file: file || undefined, previewUrl });
                  console.log('Hero image changed:', file?.name);
                }}
                onDelete={() => setHeroImage({ id: 'hero', caption: '', previewUrl: '' })}
                initialImage={heroImage.previewUrl}
              />
            </div>

            {galleryImages.map((img, index) => (
              <div key={img.id} className="space-y-2">
                <Label>Gallery Image {index + 1}</Label>
                <ImageUpload 
                  caption={img.caption}
                  onCaptionChange={(caption) => {
                    const updated = [...galleryImages];
                    updated[index].caption = caption;
                    setGalleryImages(updated);
                  }}
                  onImageChange={(file, previewUrl) => {
                    const updated = [...galleryImages];
                    updated[index] = { ...updated[index], file: file || undefined, previewUrl };
                    setGalleryImages(updated);
                  }}
                  onDelete={() => {
                    setGalleryImages(galleryImages.filter(item => item.id !== img.id));
                  }}
                  initialImage={img.previewUrl}
                />
              </div>
            ))}

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => setGalleryImages([...galleryImages, { id: Date.now().toString(), caption: '', previewUrl: '' }])}
                data-testid="button-add-gallery-image"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add more images
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Model highlight images</Label>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Key Features</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyFeatures.map((feature, index) => (
                  <ImageUpload 
                    key={feature.id} 
                    caption={feature.caption}
                    onCaptionChange={(caption) => {
                      const updated = [...keyFeatures];
                      updated[index].caption = caption;
                      setKeyFeatures(updated);
                    }}
                    onImageChange={(file, previewUrl) => {
                      const updated = [...keyFeatures];
                      updated[index] = { ...updated[index], file: file || undefined, previewUrl };
                      setKeyFeatures(updated);
                    }}
                    onDelete={() => {
                      setKeyFeatures(keyFeatures.filter(item => item.id !== feature.id));
                    }}
                    initialImage={feature.previewUrl}
                  />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <Button
                    variant="outline"
                    onClick={() => setKeyFeatures([...keyFeatures, { id: Date.now().toString(), caption: '', previewUrl: '' }])}
                    data-testid="button-add-key-feature"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more Key Feature Images
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Space & Comfort</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaceComfort.map((item, index) => (
                  <ImageUpload 
                    key={item.id} 
                    caption={item.caption}
                    onCaptionChange={(caption) => {
                      const updated = [...spaceComfort];
                      updated[index].caption = caption;
                      setSpaceComfort(updated);
                    }}
                    onImageChange={(file, previewUrl) => {
                      const updated = [...spaceComfort];
                      updated[index] = { ...updated[index], file: file || undefined, previewUrl };
                      setSpaceComfort(updated);
                    }}
                    onDelete={() => {
                      setSpaceComfort(spaceComfort.filter(img => img.id !== item.id));
                    }}
                    initialImage={item.previewUrl}
                  />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <Button
                    variant="outline"
                    onClick={() => setSpaceComfort([...spaceComfort, { id: Date.now().toString(), caption: '', previewUrl: '' }])}
                    data-testid="button-add-space-comfort"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more Space & Comfort Images
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Storage & convenience</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storageConvenience.map((item, index) => (
                  <ImageUpload 
                    key={item.id} 
                    caption={item.caption}
                    onCaptionChange={(caption) => {
                      const updated = [...storageConvenience];
                      updated[index].caption = caption;
                      setStorageConvenience(updated);
                    }}
                    onImageChange={(file, previewUrl) => {
                      const updated = [...storageConvenience];
                      updated[index] = { ...updated[index], file: file || undefined, previewUrl };
                      setStorageConvenience(updated);
                    }}
                    onDelete={() => {
                      setStorageConvenience(storageConvenience.filter(img => img.id !== item.id));
                    }}
                    initialImage={item.previewUrl}
                  />
                ))}
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                  <Button
                    variant="outline"
                    onClick={() => setStorageConvenience([...storageConvenience, { id: Date.now().toString(), caption: '', previewUrl: '' }])}
                    data-testid="button-add-storage-convenience"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add more Storage & convenience images
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline"
            onClick={() => setLocation(isEditMode ? `/models/${modelId}/edit/page2` : '/models/new/page2')}
            data-testid="button-previous-page"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          <Button 
            onClick={async () => {
              setIsUploading(true);
              try {
                console.log('🚀 Starting Page 3 image upload process...');
                console.log('📊 Current image states:');
                console.log('Hero Image:', heroImage);
                console.log('Gallery Images:', galleryImages);
                console.log('Key Features:', keyFeatures);
                console.log('Space & Comfort:', spaceComfort);
                console.log('Storage & Convenience:', storageConvenience);

                // Upload hero image if it has a file
                let heroImageUrl = heroImage.previewUrl || null;
                if (heroImage.file) {
                  console.log('📤 Uploading hero image...');
                  const uploadedUrl = await uploadImage(heroImage.file);
                  if (uploadedUrl) {
                    heroImageUrl = uploadedUrl;
                    console.log('✅ Hero image uploaded:', heroImageUrl);
                  } else {
                    console.error('❌ Hero image upload failed');
                    toast({
                      title: "Upload failed",
                      description: "Failed to upload hero image. Please try again.",
                      variant: "destructive",
                    });
                    setIsUploading(false);
                    return;
                  }
                } else {
                  console.log('⏭️ No hero image file to upload');
                }

                // Upload gallery images
                console.log('📤 Uploading gallery images...');
                const uploadedGalleryImages = await uploadMultipleImages(
                  galleryImages.map(img => ({ file: img.file, caption: img.caption, previewUrl: img.previewUrl }))
                );

                // Upload key feature images
                console.log('📤 Uploading key feature images...');
                const uploadedKeyFeatures = await uploadMultipleImages(
                  keyFeatures.map(img => ({ file: img.file, caption: img.caption, previewUrl: img.previewUrl }))
                );

                // Upload space & comfort images
                console.log('📤 Uploading space & comfort images...');
                const uploadedSpaceComfort = await uploadMultipleImages(
                  spaceComfort.map(img => ({ file: img.file, caption: img.caption, previewUrl: img.previewUrl }))
                );

                // Upload storage & convenience images
                console.log('📤 Uploading storage & convenience images...');
                const uploadedStorageConvenience = await uploadMultipleImages(
                  storageConvenience.map(img => ({ file: img.file, caption: img.caption, previewUrl: img.previewUrl }))
                );

                console.log('💾 Final upload results:');
                console.log('Hero Image URL:', heroImageUrl);
                console.log('Gallery Images:', uploadedGalleryImages);
                console.log('Key Features:', uploadedKeyFeatures);
                console.log('Space & Comfort:', uploadedSpaceComfort);
                console.log('Storage & Convenience:', uploadedStorageConvenience);

                // Save current page data to form context (convert to backend schema)
                const formDataUpdate = {
                  heroImage: heroImageUrl,
                  galleryImages: uploadedGalleryImages,
                  keyFeatureImages: uploadedKeyFeatures,
                  spaceComfortImages: uploadedSpaceComfort,
                  storageConvenienceImages: uploadedStorageConvenience
                };
                
                console.log('💾 Updating form data with:', formDataUpdate);
                updateFormData(formDataUpdate);

                toast({
                  title: "Images uploaded",
                  description: `Successfully uploaded ${uploadedGalleryImages.length + uploadedKeyFeatures.length + uploadedSpaceComfort.length + uploadedStorageConvenience.length + (heroImageUrl ? 1 : 0)} images.`,
                });

                if (isEditMode) {
                  setLocation(`/models/${modelId}/edit/page4`);
                } else {
                  setLocation('/models/new/page4');
                }
              } catch (error) {
                console.error('❌ Upload error:', error);
                toast({
                  title: "Upload failed",
                  description: "Failed to upload images. Please try again.",
                  variant: "destructive",
                });
              } finally {
                setIsUploading(false);
              }
            }}
            disabled={isUploading} 
            data-testid="button-next-page"
          >
            {isUploading ? 'Uploading Images...' : 'Next Page'}
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
