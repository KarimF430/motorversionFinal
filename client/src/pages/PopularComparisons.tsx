import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  brandId: string;
}

interface Comparison {
  model1Id: string;
  model2Id: string;
  model1BrandId: string;
  model2BrandId: string;
  order: number;
}

export default function PopularComparisons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comparisons, setComparisons] = useState<Comparison[]>(
    Array(10)
      .fill(null)
      .map((_, i) => ({
        model1Id: '',
        model2Id: '',
        model1BrandId: '',
        model2BrandId: '',
        order: i + 1,
      }))
  );

  // Fetch brands
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  // Fetch models
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  // Fetch existing comparisons
  const { data: existingComparisons } = useQuery({
    queryKey: ['/api/popular-comparisons'],
  });

  // Load existing comparisons when data arrives
  useEffect(() => {
    if (existingComparisons && Array.isArray(existingComparisons) && models.length > 0) {
      const loaded = existingComparisons.map((comp: any, index: number) => {
        const model1 = models.find((m) => m.id === comp.model1Id);
        const model2 = models.find((m) => m.id === comp.model2Id);

        return {
          model1Id: comp.model1Id || '',
          model2Id: comp.model2Id || '',
          model1BrandId: model1?.brandId || '',
          model2BrandId: model2?.brandId || '',
          order: comp.order || index + 1,
        };
      });

      // Fill remaining slots
      while (loaded.length < 10) {
        loaded.push({
          model1Id: '',
          model2Id: '',
          model1BrandId: '',
          model2BrandId: '',
          order: loaded.length + 1,
        });
      }

      setComparisons(loaded);
    }
  }, [existingComparisons, models]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any[]) => {
      console.log('Sending to API:', data);
      const response = await fetch('/api/popular-comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to save comparisons: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Save successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/popular-comparisons'] });
      toast({
        title: 'Success',
        description: `Saved ${data.count || 0} popular comparisons successfully!`,
      });
    },
    onError: (error: Error) => {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save comparisons',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    // Filter out empty comparisons and format for API
    const validComparisons = comparisons
      .filter((c) => c.model1Id && c.model2Id)
      .map((c) => ({
        model1Id: c.model1Id,
        model2Id: c.model2Id,
        order: c.order,
        isActive: true,
      }));

    console.log('Saving comparisons:', validComparisons);
    saveMutation.mutate(validComparisons);
  };

  const getModelsByBrand = (brandId: string) => {
    return models.filter((m) => m.brandId === brandId);
  };

  const updateBrand = (index: number, side: 'model1' | 'model2', brandId: string) => {
    const newComparisons = [...comparisons];
    if (side === 'model1') {
      newComparisons[index] = {
        ...newComparisons[index],
        model1BrandId: brandId,
        model1Id: '', // Reset model when brand changes
      };
    } else {
      newComparisons[index] = {
        ...newComparisons[index],
        model2BrandId: brandId,
        model2Id: '', // Reset model when brand changes
      };
    }
    setComparisons(newComparisons);
  };

  const updateModel = (index: number, side: 'model1' | 'model2', modelId: string) => {
    const newComparisons = [...comparisons];
    if (side === 'model1') {
      newComparisons[index] = { ...newComparisons[index], model1Id: modelId };
    } else {
      newComparisons[index] = { ...newComparisons[index], model2Id: modelId };
    }
    setComparisons(newComparisons);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Popular Comparison</h1>
        <Button onClick={handleSave} disabled={saveMutation.isPending} size="lg">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save All
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {comparisons.map((comparison, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-8">
              {/* Comparison Number */}
              <div className="text-3xl font-bold text-gray-400 w-12">{index + 1}</div>

              {/* Model 1 */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Brand</label>
                  <Select
                    value={comparison.model1BrandId}
                    onValueChange={(brandId) => updateBrand(index, 'model1', brandId)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Model</label>
                  <Select
                    value={comparison.model1Id}
                    onValueChange={(value) => updateModel(index, 'model1', value)}
                    disabled={!comparison.model1BrandId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsByBrand(comparison.model1BrandId).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">VS</span>
                </div>
              </div>

              {/* Model 2 */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Brand</label>
                  <Select
                    value={comparison.model2BrandId}
                    onValueChange={(brandId) => updateBrand(index, 'model2', brandId)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Model</label>
                  <Select
                    value={comparison.model2Id}
                    onValueChange={(value) => updateModel(index, 'model2', value)}
                    disabled={!comparison.model2BrandId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelsByBrand(comparison.model2BrandId).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending} size="lg">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-6 w-6" />
              Save All Comparisons
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
