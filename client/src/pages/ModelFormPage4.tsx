import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useLocation, useParams } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useModelForm } from '@/contexts/ModelFormContext';
import { uploadMultipleImages } from '@/lib/imageUpload';
import type { InsertModel } from '@shared/schema';

interface ImageData {
  id: string;
  caption: string;
  file?: File;
  previewUrl?: string;
}

export default function ModelFormPage4() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { formData, updateFormData, resetFormData } = useModelForm();
  const [colorImages, setColorImages] = useState<ImageData[]>(() => {
    if (Array.isArray(formData.colorImages) && formData.colorImages.length > 0) {
      return (formData.colorImages as any[]).map((item: any, index) => ({
        id: item.id || index.toString(),
        caption: item.caption || '',
        previewUrl: item.url || '',
        file: undefined,
      }));
    }
    return [
      { id: '1', caption: '', previewUrl: '', file: undefined },
      { id: '2', caption: '', previewUrl: '', file: undefined },
    ];
  });

  const isEditMode = !!params.id;
  const modelId = params.id;

  // Update color images when formData changes (for edit mode) - only on initial load
  useEffect(() => {
    if (isEditMode && Array.isArray(formData.colorImages) && formData.colorImages.length > 0) {
      // Only update if colorImages is empty (initial load)
      setColorImages((prev) => {
        if (prev.length <= 2 && prev.every((img) => !img.previewUrl && !img.file)) {
          return (formData.colorImages as any[]).map((item: any, index) => ({
            id: item.id || index.toString(),
            caption: item.caption || '',
            previewUrl: item.url || '',
            file: undefined,
          }));
        }
        return prev; // Don't override if user has made changes
      });
    }
  }, [isEditMode, formData.colorImages]);

  // Sync colorImages changes back to formData (for captions, etc.)
  useEffect(() => {
    const validImages = colorImages
      .filter((img) => img.previewUrl || img.file)
      .map((img) => ({
        url: img.previewUrl || '',
        caption: img.caption,
      }));

    // Only update if there are actual changes to avoid infinite loops
    const currentImages = formData.colorImages || [];
    const hasChanges = JSON.stringify(validImages) !== JSON.stringify(currentImages);

    if (hasChanges) {
      console.log('🔄 Syncing color images to form context:', validImages.length, 'images');
      updateFormData({ colorImages: validImages });
    }
  }, [colorImages]); // Don't include formData.colorImages to avoid loops

  // Debug: Log current state
  useEffect(() => {
    console.log('🎨 Page 4 - Current color images state:', {
      colorImagesCount: colorImages.length,
      colorImages: colorImages.map((img) => ({
        id: img.id,
        caption: img.caption,
        hasFile: !!img.file,
        previewUrl: img.previewUrl,
      })),
      formDataColorImages: formData.colorImages,
    });
  }, [colorImages, formData.colorImages]);

  const saveModel = useMutation({
    mutationFn: async (data: InsertModel) => {
      if (isEditMode) {
        return await apiRequest('PATCH', `/api/models/${modelId}`, data);
      } else {
        return await apiRequest('POST', '/api/models', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: isEditMode ? 'Model updated' : 'Model created',
        description: `The model has been successfully ${isEditMode ? 'updated' : 'created'}.`,
      });
      if (!isEditMode) {
        resetFormData();
      }
      setLocation('/models');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} model. Please check all required fields.`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    // Prevent double submission
    if (saveModel.isPending) {
      console.log('Submission already in progress, ignoring...');
      return;
    }

    if (!formData.brandId || !formData.name) {
      toast({
        title: 'Missing information',
        description: 'Please fill in the brand and model name.',
        variant: 'destructive',
      });
      setLocation(isEditMode ? `/models/${modelId}/edit` : '/models/new');
      return;
    }

    try {
      console.log('🚀 Starting Page 4 final submission...');
      console.log('📊 Current color images state:', colorImages);
      console.log('📊 Current form data:', formData);

      // Upload color images
      console.log('📤 Uploading color images...');
      const uploadedColorImages = await uploadMultipleImages(
        colorImages.map((img) => ({
          file: img.file,
          caption: img.caption,
          previewUrl: img.previewUrl,
        }))
      );
      console.log('✅ Color images uploaded:', uploadedColorImages);

      // Prepare model data for submission
      const modelData = {
        ...formData,
        colorImages: uploadedColorImages,
        // Ensure all required fields have defaults
        engineSummaries: formData.engineSummaries || [],
        mileageData: formData.mileageData || [],
        faqs: formData.faqs || [],
        galleryImages: formData.galleryImages || [],
        keyFeatureImages: formData.keyFeatureImages || [],
        spaceComfortImages: formData.spaceComfortImages || [],
        storageConvenienceImages: formData.storageConvenienceImages || [],
        heroImage: formData.heroImage || null,
        status: formData.status || 'active',
      };

      console.log('💾 Final model data being submitted:');
      console.log('- Hero Image:', modelData.heroImage);
      console.log('- Gallery Images:', modelData.galleryImages);
      console.log('- Key Feature Images:', modelData.keyFeatureImages);
      console.log('- Space Comfort Images:', modelData.spaceComfortImages);
      console.log('- Storage Convenience Images:', modelData.storageConvenienceImages);
      console.log('- Color Images:', modelData.colorImages);
      console.log('Full model data:', modelData);

      saveModel.mutate(modelData as InsertModel);
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload color images. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8">
      <div className="space-y-8 max-w-6xl">
        <h2 className="text-xl font-semibold">Page 4</h2>

        <div className="space-y-6">
          <Label className="text-base font-semibold">Colour Images</Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {colorImages.map((img, index) => (
              <div key={img.id} className="space-y-2">
                <Label>Colour image {index + 1}</Label>
                <ImageUpload
                  caption={img.caption}
                  onCaptionChange={(caption) => {
                    const updated = [...colorImages];
                    updated[index].caption = caption;
                    setColorImages(updated);
                  }}
                  onImageChange={(file, previewUrl) => {
                    const updated = [...colorImages];
                    updated[index] = { ...updated[index], file: file || undefined, previewUrl };
                    setColorImages(updated);
                    console.log(
                      '🖼️ Updated color image:',
                      img.id,
                      'File:',
                      !!file,
                      'PreviewURL:',
                      previewUrl
                    );
                  }}
                  onDelete={() => {
                    const updatedImages = colorImages.filter((item) => item.id !== img.id);
                    setColorImages(updatedImages);
                    // Also update the form context to keep it in sync
                    updateFormData({
                      colorImages: updatedImages
                        .map((img) => ({
                          url: img.previewUrl || '',
                          caption: img.caption,
                        }))
                        .filter((img) => img.url), // Only keep images with URLs
                    });
                    console.log(
                      '🗑️ Deleted color image:',
                      img.id,
                      'Remaining:',
                      updatedImages.length
                    );
                  }}
                  initialImage={img.previewUrl}
                />
              </div>
            ))}

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  const newImage = {
                    id: Date.now().toString(),
                    caption: '',
                    previewUrl: '',
                    file: undefined,
                  };
                  const updatedImages = [...colorImages, newImage];
                  setColorImages(updatedImages);
                  console.log(
                    '➕ Added new color image slot:',
                    newImage.id,
                    'Total:',
                    updatedImages.length
                  );
                }}
                data-testid="button-add-color-image"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add more images
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() =>
              setLocation(isEditMode ? `/models/${modelId}/edit/page3` : '/models/new/page3')
            }
            data-testid="button-previous-page"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saveModel.isPending}
            data-testid="button-save-all-data"
          >
            {saveModel.isPending ? 'Saving...' : isEditMode ? 'Update Model' : 'Save All The Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
