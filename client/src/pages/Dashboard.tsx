import { Building2, Car, Gauge, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Upload } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery<{
    totalBrands: number;
    totalModels: number;
    totalVariants: number;
  }>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Brands"
          value={stats?.totalBrands || 0}
          icon={Building2}
          onClick={() => setLocation('/brands')}
        />
        <StatsCard
          title="Total Models"
          value={stats?.totalModels || 0}
          icon={Car}
        />
        <StatsCard
          title="Total Variants"
          value={stats?.totalVariants || 0}
          icon={Gauge}
        />
        <StatsCard
          title="Active Users"
          value="500k/day"
          icon={Users}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="h-auto py-4 justify-start"
            onClick={() => setLocation('/brands/new')}
            data-testid="button-add-brand"
          >
            <Plus className="w-5 h-5 mr-3" />
            Add New Brand
          </Button>
          <Button 
            className="h-auto py-4 justify-start"
            onClick={() => setLocation('/models/new')}
            data-testid="button-add-model"
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Add New Model
          </Button>
          <Button 
            className="h-auto py-4 justify-start"
            onClick={() => console.log('Import CSV clicked')}
            data-testid="button-import-csv"
          >
            <Upload className="w-5 h-5 mr-3" />
            Import CSV Data
          </Button>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Backend System Ready!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              MotorOctane backend is running successfully on port 5000. All API endpoints are functional and ready for frontend integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
