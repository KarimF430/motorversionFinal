import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useModelForm } from "@/contexts/ModelFormContext";
import type { InsertModel } from "@shared/schema";

export default function ModelFormPage4() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { formData, resetFormData } = useModelForm();
  const [colorImages, setColorImages] = useState([{ id: '1' }, { id: '2' }]);

  const createModel = useMutation({
    mutationFn: async (data: InsertModel) => {
      return await apiRequest('/api/models', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Model created",
        description: "The model has been successfully created.",
      });
      resetFormData();
      setLocation('/models');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create model. Please check all required fields.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.brandId || !formData.name) {
      toast({
        title: "Missing information",
        description: "Please fill in the brand and model name.",
        variant: "destructive",
      });
      setLocation('/models/new');
      return;
    }
    createModel.mutate(formData as InsertModel);
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
                <ImageUpload />
              </div>
            ))}

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => setColorImages([...colorImages, { id: Date.now().toString() }])}
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
            onClick={() => setLocation('/models/new/page3')}
            data-testid="button-previous-page"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createModel.isPending}
            data-testid="button-save-all-data"
          >
            {createModel.isPending ? 'Saving...' : 'Save All The Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
