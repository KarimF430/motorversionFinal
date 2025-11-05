import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import ModelCard from '@/components/ModelCard';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import type { Model, Brand } from '@shared/schema';

export default function ModelList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: models = [], isLoading } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const deleteModel = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      toast({
        title: 'Model deleted',
        description: 'The model has been successfully deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete model. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)
    ) {
      deleteModel.mutate(id);
    }
  };

  // Filter models based on selected brand and status
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const brandMatch = selectedBrandId === 'all' || model.brandId === selectedBrandId;
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'active' && model.status === 'active') ||
        (statusFilter === 'inactive' && model.status === 'inactive');
      return brandMatch && statusMatch;
    });
  }, [models, selectedBrandId, statusFilter]);

  // Get the selected brand name for display
  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId);
  const displayTitle =
    selectedBrandId === 'all' ? 'All Models' : `${selectedBrand?.name || ''} Models`;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit Models</h1>
          <Button onClick={() => setLocation('/models/new')} data-testid="button-add-model">
            <Plus className="w-4 h-4 mr-2" />
            Add New Model
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Edit Models</h1>

          {/* Brand Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="px-3 py-1.5 pr-8 border rounded-md text-sm bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              data-testid="select-brand-filter"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 pr-8 border rounded-md text-sm bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              data-testid="select-status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">{displayTitle}</h2>
          <span className="text-sm text-gray-500">({filteredModels.length} models)</span>
          <Button onClick={() => setLocation('/models/new')} data-testid="button-add-model">
            <Plus className="w-4 h-4 mr-2" />
            Add New Model
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {models.length === 0
              ? 'No models found. Create your first model to get started.'
              : 'No models match the selected filters.'}
          </div>
        ) : (
          filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              id={model.id}
              name={model.name}
              onEdit={() => setLocation(`/models/${model.id}/edit`)}
              onDelete={() => handleDelete(model.id, model.name)}
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
