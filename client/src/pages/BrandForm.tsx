import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import FAQBuilder from "@/components/FAQBuilder";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Brand, InsertBrand } from "@shared/schema";

export default function BrandForm() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    ranking: 1,
    status: 'active',
    summary: '',
    faqs: [] as { question: string; answer: string }[],
  });

  // Fetch brand data if editing
  const { data: brand, isLoading } = useQuery<Brand>({
    queryKey: ['/api/brands', id],
    enabled: isEditing,
  });

  useEffect(() => {
    if (brand && isEditing) {
      setFormData({
        name: brand.name,
        ranking: brand.ranking,
        status: brand.status,
        summary: brand.summary || '',
        faqs: (brand.faqs as { question: string; answer: string }[]) || [],
      });
    }
  }, [brand, isEditing]);

  const createBrand = useMutation({
    mutationFn: async (data: InsertBrand) => {
      return await apiRequest('/api/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Brand created",
        description: "The brand has been successfully created.",
      });
      setLocation('/brands');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create brand.",
        variant: "destructive",
      });
    },
  });

  const updateBrand = useMutation({
    mutationFn: async (data: Partial<InsertBrand>) => {
      return await apiRequest(`/api/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brands', id] });
      toast({
        title: "Brand updated",
        description: "The brand has been successfully updated.",
      });
      setLocation('/brands');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brand.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateBrand.mutate(formData);
    } else {
      createBrand.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Brand' : 'Add New Brand'}</h1>
          {isEditing && brand && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-normal">id:</Label>
              <Input 
                value={brand.id}
                disabled
                className="w-40 font-mono text-sm bg-muted"
                data-testid="input-brand-id"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            type="button"
            variant={formData.status === 'active' ? 'default' : 'outline'}
            onClick={() => setFormData({ ...formData, status: 'active' })}
            data-testid="button-activate-brand"
          >
            activate Brand
          </Button>
          <Button 
            type="button"
            variant={formData.status === 'inactive' ? 'destructive' : 'outline'}
            onClick={() => setFormData({ ...formData, status: 'inactive' })}
            data-testid="button-deactivate-brand"
          >
            Deactivate Brand
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              id="brandName"
              placeholder="Text field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-brand-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandRanking">Brand Ranking</Label>
            <select 
              id="brandRanking"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.ranking}
              onChange={(e) => setFormData({ ...formData, ranking: parseInt(e.target.value) })}
              data-testid="select-brand-ranking"
            >
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Brand Logo</Label>
            <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-md cursor-pointer hover-elevate active-elevate-2">
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Upload Logo</span>
              <input type="file" className="hidden" accept="image/*" data-testid="input-brand-logo" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Brand Summary</Label>
            <RichTextEditor
              value={formData.summary}
              onChange={(value) => setFormData({ ...formData, summary: value })}
              placeholder="Long Text Field"
              minHeight="min-h-64"
            />
          </div>

          <div className="space-y-2">
            <Label>Brand FAQ</Label>
            <FAQBuilder 
              items={formData.faqs}
              onChange={(faqs) => setFormData({ ...formData, faqs })}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            data-testid="button-save-brand"
            disabled={createBrand.isPending || updateBrand.isPending}
          >
            {createBrand.isPending || updateBrand.isPending ? 'Saving...' : isEditing ? 'Update Brand' : 'Save Brand'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            data-testid="button-cancel"
            onClick={() => setLocation('/brands')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
