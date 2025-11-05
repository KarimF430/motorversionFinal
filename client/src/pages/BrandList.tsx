import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BrandCard from "@/components/BrandCard";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Brand } from "@shared/schema";

export default function BrandList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Brand deleted",
        description: "The brand has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete brand.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteBrand = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteBrand.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Total Brands</h1>
          <Button onClick={() => setLocation('/brands/new')} data-testid="button-add-brand">
            <Plus className="w-4 h-4 mr-2" />
            Add New Brand
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Total Brands</h1>
          <select className="px-3 py-1.5 border rounded-md text-sm" data-testid="select-filters">
            <option>Filters</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <Button onClick={() => setLocation('/brands/new')} data-testid="button-add-brand">
          <Plus className="w-4 h-4 mr-2" />
          Add New Brand
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No brands found. Create your first brand to get started.
          </div>
        ) : (
          brands.map((brand) => (
            <BrandCard
              key={brand.id}
              id={brand.id}
              name={brand.name}
              logo={brand.logo || undefined}
              rank={brand.ranking}
              onEdit={() => setLocation(`/brands/${brand.id}/edit`)}
              onDelete={() => handleDeleteBrand(brand.id, brand.name)}
            />
          ))
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="ghost" size="icon" data-testid="button-next-page">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
