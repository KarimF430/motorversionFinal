import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useModelForm } from "@/contexts/ModelFormContext";
import type { Brand, Model } from "@shared/schema";

export default function ModelFormPage1() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { formData, updateFormData, resetFormData } = useModelForm();
  const isEditMode = !!params.id;
  const editingModelId = params.id;
  
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  // Fetch existing model data if in edit mode
  const { data: existingModel, isLoading: modelLoading } = useQuery<Model>({
    queryKey: ['/api/models', editingModelId],
    enabled: isEditMode && !!editingModelId,
  });

  const [localData, setLocalData] = useState({
    brandId: '',
    name: '',
    isPopular: false,
    isNew: false,
    popularRank: null as number | null,
    newRank: null as number | null,
    bodyType: '',
    subBodyType: '',
    launchDate: '',
    fuelTypes: [] as string[],
    transmissions: [] as string[],
    brochureFile: null as File | null,
    headerSeo: '',
    pros: '',
    cons: '',
    description: '',
    exteriorDesign: '',
    comfortConvenience: '',
  });

  // Load existing model data when in edit mode (only once when component mounts or model changes)
  useEffect(() => {
    if (isEditMode && existingModel && existingModel.id && !modelLoading) {
      console.log('Loading existing model data:', existingModel);
      setLocalData({
        brandId: existingModel.brandId || '',
        name: existingModel.name || '',
        isPopular: existingModel.isPopular || false,
        isNew: existingModel.isNew || false,
        popularRank: existingModel.popularRank,
        newRank: existingModel.newRank,
        bodyType: existingModel.bodyType || '',
        subBodyType: existingModel.subBodyType || '',
        launchDate: existingModel.launchDate || '',
        fuelTypes: existingModel.fuelTypes || [],
        transmissions: existingModel.transmissions || [],
        brochureFile: null,
        headerSeo: existingModel.headerSeo || '',
        pros: existingModel.pros || '',
        cons: existingModel.cons || '',
        description: existingModel.description || '',
        exteriorDesign: existingModel.exteriorDesign || '',
        comfortConvenience: existingModel.comfortConvenience || '',
      });
      // Also update the form context with existing data (only if different)
      if (!(formData as any).id || (formData as any).id !== existingModel.id) {
        updateFormData(existingModel);
      }
    } else if (!isEditMode && (formData as any).id) {
      // Reset form data when switching from edit to create mode
      resetFormData();
      setLocalData({
        brandId: '',
        name: '',
        isPopular: false,
        isNew: false,
        popularRank: null,
        newRank: null,
        bodyType: '',
        subBodyType: '',
        launchDate: '',
        fuelTypes: [],
        transmissions: [],
        brochureFile: null,
        headerSeo: '',
        pros: '',
        cons: '',
        description: '',
        exteriorDesign: '',
        comfortConvenience: '',
      });
    }
  }, [isEditMode, existingModel?.id, modelLoading]); // Only depend on edit mode, model ID, and loading state

  // Generate Model ID when brand and name change
  const generateModelId = (brandName: string, modelName: string) => {
    if (!brandName || !modelName) return '';
    const brandCode = brandName.substring(0, 2).toUpperCase();
    const modelCode = modelName.substring(0, 2).toUpperCase();
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    return `${brandCode}${modelCode}${digits}`;
  };

  const [generatedModelId, setGeneratedModelId] = useState('');
  
  useEffect(() => {
    const selectedBrand = brands.find(b => b.id === localData.brandId);
    if (selectedBrand && localData.name) {
      const newId = generateModelId(selectedBrand.name, localData.name);
      setGeneratedModelId(newId);
    }
  }, [localData.brandId, localData.name, brands]);

  const handleNext = () => {
    console.log('Page 1 - Saving data:', localData);
    updateFormData(localData);
    if (isEditMode) {
      setLocation(`/models/${editingModelId}/edit/page2`);
    } else {
      setLocation('/models/new/page2');
    }
  };

  if (brandsLoading || (isEditMode && modelLoading)) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isEditMode ? 'Edit Model' : 'Add New Model'}</h1>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-normal">Model Id</Label>
            <Input 
              value={isEditMode ? editingModelId : generatedModelId}
              disabled
              className="w-32 font-mono text-sm bg-muted"
              data-testid="input-model-id"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            type="button"
            variant="default"
            data-testid="button-activate-model"
          >
            activate Model
          </Button>
          <Button 
            type="button"
            variant="outline"
            data-testid="button-deactivate-model"
          >
            Deactivate Model
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Select Brand</Label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={localData.brandId}
              onChange={(e) => setLocalData({ ...localData, brandId: e.target.value })}
              data-testid="select-brand"
            >
              <option value="">Select a brand...</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={localData.isPopular}
                onChange={(e) => setLocalData({ ...localData, isPopular: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-is-popular"
              />
              <Label htmlFor="isPopular" className="font-normal">Is Model Popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isNew"
                checked={localData.isNew}
                onChange={(e) => setLocalData({ ...localData, isNew: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-is-new"
              />
              <Label htmlFor="isNew" className="font-normal">Is Model New</Label>
            </div>
          </div>
        </div>

        {localData.isPopular && (
          <div className="space-y-2">
            <Label>Popular Model Ranking (1-20)</Label>
            <select 
              className="w-full md:w-48 px-3 py-2 border rounded-md" 
              value={localData.popularRank || ''}
              onChange={(e) => setLocalData({ ...localData, popularRank: e.target.value ? parseInt(e.target.value) : null })}
              data-testid="select-popular-rank"
            >
              <option value="">Select...</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}

        {localData.isNew && (
          <div className="space-y-2">
            <Label>New Model Ranking (1-20)</Label>
            <select 
              className="w-full md:w-48 px-3 py-2 border rounded-md" 
              value={localData.newRank || ''}
              onChange={(e) => setLocalData({ ...localData, newRank: e.target.value ? parseInt(e.target.value) : null })}
              data-testid="select-new-rank"
            >
              <option value="">Select...</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Body Type</Label>
            <select 
              className="w-full px-3 py-2 border rounded-md" 
              value={localData.bodyType}
              onChange={(e) => setLocalData({ ...localData, bodyType: e.target.value })}
              data-testid="select-body-type"
            >
              <option value="">List</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="MPV">MPV</option>
              <option value="Coupe">Coupe</option>
              <option value="Pickup">Pickup</option>
              <option value="Convertible">Convertible</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Sub-body Type</Label>
            <select 
              className="w-full px-3 py-2 border rounded-md" 
              value={localData.subBodyType}
              onChange={(e) => setLocalData({ ...localData, subBodyType: e.target.value })}
              data-testid="select-subbody-type"
            >
              <option value="">List</option>
              <option value="Premium Level">Premium Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Electric Entry Level">Electric Entry Level</option>
              <option value="Mid Size">Mid Size</option>
              <option value="Entry Level Luxury">Entry Level Luxury</option>
              <option value="Compact Luxury">Compact Luxury</option>
              <option value="Compact">Compact</option>
              <option value="Full Size Luxury">Full Size Luxury</option>
              <option value="Flagship Luxury Electric">Flagship Luxury Electric</option>
              <option value="Flagship Luxury">Flagship Luxury</option>
              <option value="Sports Car">Sports Car</option>
              <option value="Compact Luxury Electric">Compact Luxury Electric</option>
              <option value="Luxury Entry Level">Luxury Entry Level</option>
              <option value="Luxury Electric Entry Level">Luxury Electric Entry Level</option>
              <option value="Luxury Sports">Luxury Sports</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Model Name</Label>
            <Input 
              placeholder="Text field" 
              value={localData.name}
              onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
              data-testid="input-model-name" 
            />
          </div>

          <div className="space-y-2">
            <Label>Launched time line</Label>
            <Input 
              type="month" 
              placeholder="Calendar popup" 
              value={localData.launchDate}
              onChange={(e) => setLocalData({ ...localData, launchDate: e.target.value })}
              data-testid="input-launch-date" 
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Brochure</Label>
            <label className="flex items-center justify-center h-10 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              <span className="text-sm">{localData.brochureFile ? localData.brochureFile.name : 'Upload PDF'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      alert('Please select a PDF file only');
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File size must be less than 5MB');
                      return;
                    }
                    setLocalData({ ...localData, brochureFile: file });
                  }
                }}
                data-testid="input-brochure" 
              />
            </label>
            {localData.brochureFile && (
              <p className="text-xs text-green-600">✓ {localData.brochureFile.name} selected</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Model Fuel Type</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto bg-white">
              {['petrol', 'diesel', 'electric', 'hybrid', 'cng'].map((fuel) => (
                <div key={fuel} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`fuel-${fuel}`}
                    checked={localData.fuelTypes.includes(fuel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalData({ ...localData, fuelTypes: [...localData.fuelTypes, fuel] });
                      } else {
                        setLocalData({ ...localData, fuelTypes: localData.fuelTypes.filter(f => f !== fuel) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`fuel-${fuel}`} className="font-normal capitalize text-sm">{fuel}</Label>
                </div>
              ))}
            </div>
            {localData.fuelTypes.length > 0 && (
              <p className="text-xs text-gray-600">Selected: {localData.fuelTypes.join(', ')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Model Transmission</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto bg-white">
              {['manual', 'automatic', 'cvt', 'amt', 'dct', 'imt'].map((transmission) => (
                <div key={transmission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`transmission-${transmission}`}
                    checked={localData.transmissions.includes(transmission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalData({ ...localData, transmissions: [...localData.transmissions, transmission] });
                      } else {
                        setLocalData({ ...localData, transmissions: localData.transmissions.filter(t => t !== transmission) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`transmission-${transmission}`} className="font-normal uppercase text-sm">{transmission}</Label>
                </div>
              ))}
            </div>
            {localData.transmissions.length > 0 && (
              <p className="text-xs text-gray-600">Selected: {localData.transmissions.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Model Header SEO text</Label>
          <RichTextEditor
            value={localData.headerSeo}
            onChange={(value) => setLocalData({ ...localData, headerSeo: value })}
            placeholder="Long Text Field"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Model Pro's & Cons</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Pro's</Label>
              <RichTextEditor
                value={localData.pros}
                onChange={(value) => setLocalData({ ...localData, pros: value })}
                placeholder="Long Text Field"
              />
            </div>
            <div className="space-y-2">
              <Label>Con's</Label>
              <RichTextEditor
                value={localData.cons}
                onChange={(value) => setLocalData({ ...localData, cons: value })}
                placeholder="Long Text Field"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Model Summary</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                value={localData.description}
                onChange={(value) => setLocalData({ ...localData, description: value })}
                placeholder="Long Text Field"
              />
            </div>
            <div className="space-y-2">
              <Label>Exterior Design</Label>
              <RichTextEditor
                value={localData.exteriorDesign}
                onChange={(value) => setLocalData({ ...localData, exteriorDesign: value })}
                placeholder="Long Text Field"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comfort & Convenience</Label>
            <RichTextEditor
              value={localData.comfortConvenience}
              onChange={(value) => setLocalData({ ...localData, comfortConvenience: value })}
              placeholder="Long Text Field"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} data-testid="button-next-page">
            Next Page
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
