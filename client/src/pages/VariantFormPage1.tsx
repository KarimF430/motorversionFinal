import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Brand, Model, Variant } from "@shared/schema";

export default function VariantFormPage1() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isEditMode = !!params.id;
  
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  const { data: existingVariant } = useQuery<Variant>({
    queryKey: ['/api/variants', params.id],
    enabled: isEditMode && !!params.id,
  });

  const [formData, setFormData] = useState({
    brandId: '',
    modelId: '',
    name: '',
    status: 'active',
    isValueForMoney: false,
    price: '',
    keyFeatures: '',
    headerSummary: '',
    description: '',
    exteriorDesign: '',
    comfortConvenience: '',
  });

  const [highlightImages, setHighlightImages] = useState<Array<{ url: string; caption: string }>>([]);
  const [generatedId, setGeneratedId] = useState('');

  // Load existing variant data
  useEffect(() => {
    if (existingVariant) {
      setFormData({
        brandId: existingVariant.brandId,
        modelId: existingVariant.modelId,
        name: existingVariant.name,
        status: existingVariant.status,
        isValueForMoney: existingVariant.isValueForMoney || false,
        price: existingVariant.price?.toString() || '',
        keyFeatures: existingVariant.keyFeatures || '',
        headerSummary: existingVariant.headerSummary || '',
        description: existingVariant.description || '',
        exteriorDesign: existingVariant.exteriorDesign || '',
        comfortConvenience: existingVariant.comfortConvenience || '',
      });
      setHighlightImages(existingVariant.highlightImages || []);
      setGeneratedId(existingVariant.id);
    }
  }, [existingVariant]);

  // Generate ID when brand, model, and variant name are selected
  useEffect(() => {
    if (formData.brandId && formData.modelId && formData.name && !isEditMode) {
      const brand = brands.find(b => b.id === formData.brandId);
      const model = models.find(m => m.id === formData.modelId);
      
      if (brand && model) {
        const brandPrefix = brand.name.substring(0, 2).toUpperCase();
        const modelPrefix = model.name.substring(0, 2).toUpperCase();
        const variantPrefix = formData.name.substring(0, 2).toUpperCase();
        const id = `${brandPrefix}${modelPrefix}${variantPrefix}00001`;
        setGeneratedId(id);
      }
    }
  }, [formData.brandId, formData.modelId, formData.name, brands, models, isEditMode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      setHighlightImages(prev => [...prev, { url: data.url, caption: '' }]);
      toast({
        title: "Image uploaded",
        description: "Image has been successfully uploaded.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setHighlightImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setHighlightImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Saving variant with data:', data);
      if (isEditMode) {
        return await apiRequest('PATCH', `/api/variants/${params.id}`, data);
      } else {
        return await apiRequest('POST', '/api/variants', data);
      }
    },
    onSuccess: (response) => {
      console.log('Variant saved successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/variants'] });
      toast({
        title: "Success",
        description: `Variant ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      setLocation('/variants');
    },
    onError: (error: any) => {
      console.error('Error saving variant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save variant.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log('🔍 handleSave called with formData:', formData);
    
    // Validate required fields
    if (!formData.brandId || !formData.modelId || !formData.name || !formData.price || formData.price.trim() === '') {
      console.error('❌ Validation failed - missing fields:', {
        brandId: formData.brandId,
        modelId: formData.modelId,
        name: formData.name,
        price: formData.price
      });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Brand, Model, Name, Price).",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      console.error('❌ Invalid price:', formData.price);
      toast({
        title: "Validation Error",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      brandId: formData.brandId,
      modelId: formData.modelId,
      name: formData.name,
      status: formData.status,
      isValueForMoney: formData.isValueForMoney,
      price: price,
      keyFeatures: formData.keyFeatures || null,
      headerSummary: formData.headerSummary || null,
      description: formData.description || null,
      exteriorDesign: formData.exteriorDesign || null,
      comfortConvenience: formData.comfortConvenience || null,
      highlightImages: highlightImages.length > 0 ? highlightImages : [],
    };

    console.log('✅ Submitting variant data:', submitData);
    saveMutation.mutate(submitData);
  };

  const navigateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return await apiRequest('PATCH', `/api/variants/${params.id}`, data);
      } else {
        return await apiRequest('POST', '/api/variants', data);
      }
    },
    onSuccess: (response) => {
      console.log('Variant saved, navigating to page 2');
      queryClient.invalidateQueries({ queryKey: ['/api/variants'] });
      toast({
        title: "Success",
        description: "Page 1 data saved. Moving to Page 2.",
      });
      
      // Navigate to page 2 with the variant ID
      if (isEditMode) {
        setLocation(`/variants/${params.id}/edit/page2`);
      } else {
        // For new variants, we need the ID from the response
        const variantId = (response as any).id;
        setLocation(`/variants/${variantId}/edit/page2`);
      }
    },
    onError: (error: any) => {
      console.error('Error saving variant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save variant.",
        variant: "destructive",
      });
    },
  });

  const handleNextPage = () => {
    // Validate required fields first
    if (!formData.brandId || !formData.modelId || !formData.name || !formData.price || formData.price.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Brand, Model, Name, Price).",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    // Save the data first, then navigate to page 2
    const submitData = {
      brandId: formData.brandId,
      modelId: formData.modelId,
      name: formData.name,
      status: formData.status,
      isValueForMoney: formData.isValueForMoney,
      price: price,
      keyFeatures: formData.keyFeatures || null,
      headerSummary: formData.headerSummary || null,
      description: formData.description || null,
      exteriorDesign: formData.exteriorDesign || null,
      comfortConvenience: formData.comfortConvenience || null,
      highlightImages: highlightImages.length > 0 ? highlightImages : [],
    };

    console.log('Saving and navigating to page 2:', submitData);
    navigateMutation.mutate(submitData);
  };

  // Filter models by selected brand
  const filteredModels = formData.brandId 
    ? models.filter(m => m.brandId === formData.brandId)
    : [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Edit Variant' : 'Add New Variant'}
        </h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Parent Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Select Brand *</Label>
            <select
              id="brand"
              value={formData.brandId}
              onChange={(e) => handleInputChange('brandId', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Choose Brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Select Model *</Label>
            <select
              id="model"
              value={formData.modelId}
              onChange={(e) => handleInputChange('modelId', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
              disabled={!formData.brandId}
            >
              <option value="">Choose Model</option>
              {filteredModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status and Value for Money */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Variant Status</Label>
            <RadioGroup value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="font-normal cursor-pointer">Active Variant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="font-normal cursor-pointer">Deactivate Variant</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Is Variant Value for Money</Label>
            <RadioGroup 
              value={formData.isValueForMoney ? 'yes' : 'no'} 
              onValueChange={(value) => handleInputChange('isValueForMoney', value === 'yes')}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="vfm-yes" />
                  <Label htmlFor="vfm-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="vfm-no" />
                  <Label htmlFor="vfm-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* ID Display */}
        {generatedId && (
          <div className="space-y-2">
            <Label>Generated ID</Label>
            <Input value={generatedId} disabled className="bg-gray-50" />
          </div>
        )}

        {/* Variant Name and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Variant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., VXI, ZXI Plus"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Variant Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter price in rupees"
              required
            />
          </div>
        </div>

        {/* Variant Key Features */}
        <div className="space-y-2">
          <Label htmlFor="keyFeatures">Variant Key Features</Label>
          <Textarea
            id="keyFeatures"
            value={formData.keyFeatures}
            onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
            rows={4}
            placeholder="Enter key features..."
          />
        </div>

        {/* Variant Header Summary */}
        <div className="space-y-2">
          <Label>Variant Header Summary</Label>
          <RichTextEditor
            value={formData.headerSummary}
            onChange={(value) => handleInputChange('headerSummary', value)}
          />
        </div>

        {/* Variant Highlight Images */}
        <div className="space-y-4">
          <Label>Variant Highlight Images</Label>
          <div className="space-y-4">
            {highlightImages.map((img, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <img src={img.url} alt="" className="w-24 h-24 object-cover rounded" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={img.caption}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    placeholder="Image caption"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveImage(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="highlight-upload"
              />
              <label htmlFor="highlight-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Add more Key Feature images</p>
              </label>
            </div>
          </div>
        </div>

        {/* Variant SEO Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variant SEO Summary</h3>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Exterior Design</Label>
            <RichTextEditor
              value={formData.exteriorDesign}
              onChange={(value) => handleInputChange('exteriorDesign', value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Comfort & Convenience</Label>
            <RichTextEditor
              value={formData.comfortConvenience}
              onChange={(value) => handleInputChange('comfortConvenience', value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={() => setLocation('/variants')}>
            Cancel
          </Button>
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Data'}
            </Button>
            <Button onClick={handleNextPage} disabled={saveMutation.isPending}>
              Next Page →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
