import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Variant } from '@shared/schema';

export default function VariantFormPage5() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isEditMode = !!params.id;

  const { data: existingVariant } = useQuery<Variant>({
    queryKey: ['/api/variants', params.id],
    enabled: isEditMode && !!params.id,
  });

  const [formData, setFormData] = useState({
    // Dimensions
    groundClearance: '',
    length: '',
    width: '',
    height: '',
    wheelbase: '',
    turningRadius: '',
    kerbWeight: '',

    // Tyre & Suspension
    frontTyreProfile: '',
    rearTyreProfile: '',
    spareTyreProfile: '',
    spareWheelType: '',
    frontSuspension: '',
    rearSuspension: '',

    // Storage
    cupholders: '',
    fuelTankCapacity: '',
    bootSpace: '',
    bootSpaceAfterFoldingRearRowSeats: '',
  });

  // Load existing variant data
  useEffect(() => {
    if (existingVariant) {
      setFormData({
        groundClearance: (existingVariant as any).groundClearance || '',
        length: (existingVariant as any).length || '',
        width: (existingVariant as any).width || '',
        height: (existingVariant as any).height || '',
        wheelbase: (existingVariant as any).wheelbase || '',
        turningRadius: (existingVariant as any).turningRadius || '',
        kerbWeight: (existingVariant as any).kerbWeight || '',
        frontTyreProfile: (existingVariant as any).frontTyreProfile || '',
        rearTyreProfile: (existingVariant as any).rearTyreProfile || '',
        spareTyreProfile: (existingVariant as any).spareTyreProfile || '',
        spareWheelType: (existingVariant as any).spareWheelType || '',
        frontSuspension: (existingVariant as any).frontSuspension || '',
        rearSuspension: (existingVariant as any).rearSuspension || '',
        cupholders: (existingVariant as any).cupholders || '',
        fuelTankCapacity: (existingVariant as any).fuelTankCapacity || '',
        bootSpace: (existingVariant as any).bootSpace || '',
        bootSpaceAfterFoldingRearRowSeats:
          (existingVariant as any).bootSpaceAfterFoldingRearRowSeats || '',
      });
    }
  }, [existingVariant]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode) {
        return await apiRequest('PATCH', `/api/variants/${params.id}`, data);
      } else {
        return await apiRequest('POST', '/api/variants', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/variants'] });
      toast({
        title: 'Success',
        description: 'All variant data saved successfully!',
      });
      setLocation('/variants');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save variant data.',
        variant: 'destructive',
      });
    },
  });

  const handleSaveAllData = () => {
    saveMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Page 5</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-8">
        {/* Dimensions */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Dimensions</h3>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Ground Clearance</Label>
              <Input
                value={formData.groundClearance}
                onChange={(e) => handleInputChange('groundClearance', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Length</Label>
              <Input
                value={formData.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                value={formData.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Wheelbase</Label>
              <Textarea
                value={formData.wheelbase}
                onChange={(e) => handleInputChange('wheelbase', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Turning Radius</Label>
              <Input
                value={formData.turningRadius}
                onChange={(e) => handleInputChange('turningRadius', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Kerb Weight</Label>
              <Input
                value={formData.kerbWeight}
                onChange={(e) => handleInputChange('kerbWeight', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Tyre & Suspension */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Tyre & Suspension</h3>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Front Tyre Profile</Label>
              <Input
                value={formData.frontTyreProfile}
                onChange={(e) => handleInputChange('frontTyreProfile', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Rear Tyre Profile</Label>
              <Input
                value={formData.rearTyreProfile}
                onChange={(e) => handleInputChange('rearTyreProfile', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Spare Tyre Profile</Label>
              <Input
                value={formData.spareTyreProfile}
                onChange={(e) => handleInputChange('spareTyreProfile', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Spare Wheel Type</Label>
              <Input
                value={formData.spareWheelType}
                onChange={(e) => handleInputChange('spareWheelType', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Front Suspension</Label>
              <Textarea
                value={formData.frontSuspension}
                onChange={(e) => handleInputChange('frontSuspension', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Rear Suspension</Label>
              <Input
                value={formData.rearSuspension}
                onChange={(e) => handleInputChange('rearSuspension', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Storage</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cupholders</Label>
              <Input
                value={formData.cupholders}
                onChange={(e) => handleInputChange('cupholders', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Fuel Tank Capacity</Label>
              <Input
                value={formData.fuelTankCapacity}
                onChange={(e) => handleInputChange('fuelTankCapacity', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Boot Space</Label>
              <Input
                value={formData.bootSpace}
                onChange={(e) => handleInputChange('bootSpace', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Boot Space after folding rear row seats</Label>
              <Input
                value={formData.bootSpaceAfterFoldingRearRowSeats}
                onChange={(e) =>
                  handleInputChange('bootSpaceAfterFoldingRearRowSeats', e.target.value)
                }
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Final Save Button */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() =>
              setLocation(isEditMode ? `/variants/${params.id}/edit/page4` : '/variants/new/page4')
            }
          >
            ← Previous Page
          </Button>

          <Button
            onClick={handleSaveAllData}
            disabled={saveMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save All The Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
