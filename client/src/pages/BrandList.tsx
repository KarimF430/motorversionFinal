import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BrandCard from "@/components/BrandCard";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Brand } from "@shared/schema";

export default function BrandList() {
  const [, setLocation] = useLocation();

  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

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
