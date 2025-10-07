import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ModelCard from "@/components/ModelCard";
import { useLocation } from "wouter";

export default function ModelList() {
  const [, setLocation] = useLocation();

  // todo: remove mock functionality - replace with real data
  const models = [
    { id: '1', name: 'Swift' },
    { id: '2', name: 'Swift Dezire' },
    { id: '3', name: 'WagonR' },
    { id: '4', name: 'Swift' },
    { id: '5', name: 'Swift Dezire' },
    { id: '6', name: 'WagonR' },
    { id: '7', name: 'Swift' },
    { id: '8', name: 'Swift Dezire' },
    { id: '9', name: 'WagonR' },
    { id: '10', name: 'Swift' },
    { id: '11', name: 'Swift Dezire' },
    { id: '12', name: 'WagonR' },
    { id: '13', name: 'Swift' },
    { id: '14', name: 'Swift Dezire' },
    { id: '15', name: 'WagonR' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Edit Models</h1>
          <select className="px-3 py-1.5 border rounded-md text-sm" data-testid="select-filters">
            <option>Filters</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">Maruti Suzuki Models</h2>
          <Button onClick={() => setLocation('/models/new')} data-testid="button-add-model">
            <Plus className="w-4 h-4 mr-2" />
            Add New Model
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            id={model.id}
            name={model.name}
            onEdit={() => setLocation(`/models/${model.id}/edit`)}
          />
        ))}
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
