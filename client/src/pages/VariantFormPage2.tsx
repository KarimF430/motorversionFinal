import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Variant } from "@shared/schema";

export default function VariantFormPage2() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isEditMode = !!params.id;

  const { data: existingVariant } = useQuery<Variant>({
    queryKey: ['/api/variants', params.id],
    enabled: isEditMode && !!params.id,
  });

  const [formData, setFormData] = useState({
    // Engine Data
    engineName: '',
    engineSummary: '',
    engineTransmission: '',
    enginePower: '',
    engineTorque: '',
    engineSpeed: '',
    
    // Mileage
    mileageEngineName: '',
    mileageCompanyClaimed: '',
    mileageCityRealWorld: '',
    mileageHighwayRealWorld: '',
    
    // Comfort & Convenience Features
    ventilatedSeats: '',
    sunroof: '',
    airPurifier: '',
    headsUpDisplay: '',
    cruiseControl: '',
    rainSensingWipers: '',
    automaticHeadlamp: '',
    followMeHomeHeadlights: '',
    keylessEntry: '',
    ignition: '',
    ambientLighting: '',
    steeringAdjustment: '',
    airConditioning: '',
    climateZones: '',
    rearACVents: '',
    frontArmrest: '',
    rearArmrest: '',
    insideRearViewMirror: '',
    outsideRearViewMirrors: '',
    steeringMountedControls: '',
    rearWindshieldDefogger: '',
    frontWindshieldDefogger: '',
    cooledGlovebox: '',
  });

  // Load existing variant data
  useEffect(() => {
    if (existingVariant) {
      setFormData({
        engineName: existingVariant.engineName || '',
        engineSummary: existingVariant.engineSummary || '',
        engineTransmission: existingVariant.engineTransmission || '',
        enginePower: existingVariant.enginePower || '',
        engineTorque: existingVariant.engineTorque || '',
        engineSpeed: existingVariant.engineSpeed || '',
        mileageEngineName: existingVariant.mileageEngineName || '',
        mileageCompanyClaimed: existingVariant.mileageCompanyClaimed || '',
        mileageCityRealWorld: existingVariant.mileageCityRealWorld || '',
        mileageHighwayRealWorld: existingVariant.mileageHighwayRealWorld || '',
        ventilatedSeats: existingVariant.ventilatedSeats || '',
        sunroof: existingVariant.sunroof || '',
        airPurifier: existingVariant.airPurifier || '',
        headsUpDisplay: existingVariant.headsUpDisplay || '',
        cruiseControl: existingVariant.cruiseControl || '',
        rainSensingWipers: existingVariant.rainSensingWipers || '',
        automaticHeadlamp: existingVariant.automaticHeadlamp || '',
        followMeHomeHeadlights: existingVariant.followMeHomeHeadlights || '',
        keylessEntry: existingVariant.keylessEntry || '',
        ignition: existingVariant.ignition || '',
        ambientLighting: existingVariant.ambientLighting || '',
        steeringAdjustment: existingVariant.steeringAdjustment || '',
        airConditioning: existingVariant.airConditioning || '',
        climateZones: existingVariant.climateZones || '',
        rearACVents: existingVariant.rearACVents || '',
        frontArmrest: existingVariant.frontArmrest || '',
        rearArmrest: existingVariant.rearArmrest || '',
        insideRearViewMirror: existingVariant.insideRearViewMirror || '',
        outsideRearViewMirrors: existingVariant.outsideRearViewMirrors || '',
        steeringMountedControls: existingVariant.steeringMountedControls || '',
        rearWindshieldDefogger: existingVariant.rearWindshieldDefogger || '',
        frontWindshieldDefogger: existingVariant.frontWindshieldDefogger || '',
        cooledGlovebox: existingVariant.cooledGlovebox || '',
      });
    }
  }, [existingVariant]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        title: "Success",
        description: "Variant page 2 data saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save variant data.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleNextPage = () => {
    saveMutation.mutate(formData);
    if (isEditMode) {
      setLocation(`/variants/${params.id}/edit/page3`);
    } else {
      setLocation('/variants/new/page3');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Page 2</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-8">
        {/* Variant SEO Engine data */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Variant SEO Engine data</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Title Name */}
            <div className="space-y-4">
              <h3 className="font-medium">1. Title Name</h3>
              <div className="space-y-2">
                <Label>Engine Name</Label>
                <Input
                  value={formData.engineName}
                  onChange={(e) => handleInputChange('engineName', e.target.value)}
                  placeholder="Engine Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Summary</Label>
                <RichTextEditor
                  value={formData.engineSummary}
                  onChange={(value) => handleInputChange('engineSummary', value)}
                />
              </div>
            </div>

            {/* Right Column - Spec's */}
            <div className="space-y-4">
              <h3 className="font-medium">Spec's</h3>
              
              <div className="space-y-2">
                <Label>Transmission Drop Down</Label>
                <select
                  value={formData.engineTransmission}
                  onChange={(e) => handleInputChange('engineTransmission', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Transmission</option>
                  <option value="manual">Manual</option>
                  <option value="amt">AMT</option>
                  <option value="cvt">CVT</option>
                  <option value="dct">DCT</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Power figure text field</Label>
                <Input
                  value={formData.enginePower}
                  onChange={(e) => handleInputChange('enginePower', e.target.value)}
                  placeholder="Power figure"
                />
              </div>

              <div className="space-y-2">
                <Label>Torque figure text field</Label>
                <Input
                  value={formData.engineTorque}
                  onChange={(e) => handleInputChange('engineTorque', e.target.value)}
                  placeholder="Torque figure"
                />
              </div>

              <div className="space-y-2">
                <Label>Transmission speed text field</Label>
                <Input
                  value={formData.engineSpeed}
                  onChange={(e) => handleInputChange('engineSpeed', e.target.value)}
                  placeholder="Transmission speed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Variant Mileage */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Variant Mileage</h2>
          
          <div className="space-y-4">
            <h3 className="font-medium">1. Engine & Transmission Name</h3>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.mileageEngineName}
                onChange={(e) => handleInputChange('mileageEngineName', e.target.value)}
                placeholder="Title"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Company Claimed</Label>
              <Input
                value={formData.mileageCompanyClaimed}
                onChange={(e) => handleInputChange('mileageCompanyClaimed', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>City Real World</Label>
              <Input
                value={formData.mileageCityRealWorld}
                onChange={(e) => handleInputChange('mileageCityRealWorld', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Highway Real World</Label>
              <Input
                value={formData.mileageHighwayRealWorld}
                onChange={(e) => handleInputChange('mileageHighwayRealWorld', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Specifications and Features - Comfort & Convenience */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Comfort & Convenience</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Ventilated Seats</Label>
              <Input
                value={formData.ventilatedSeats}
                onChange={(e) => handleInputChange('ventilatedSeats', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Sunroof</Label>
              <Input
                value={formData.sunroof}
                onChange={(e) => handleInputChange('sunroof', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Air Purifier</Label>
              <Input
                value={formData.airPurifier}
                onChange={(e) => handleInputChange('airPurifier', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Heads Up Display (HUD)</Label>
              <Input
                value={formData.headsUpDisplay}
                onChange={(e) => handleInputChange('headsUpDisplay', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Cruise Control</Label>
              <Input
                value={formData.cruiseControl}
                onChange={(e) => handleInputChange('cruiseControl', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Rain Sensing Wipers</Label>
              <Input
                value={formData.rainSensingWipers}
                onChange={(e) => handleInputChange('rainSensingWipers', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Automatic Headlamp</Label>
              <Input
                value={formData.automaticHeadlamp}
                onChange={(e) => handleInputChange('automaticHeadlamp', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Follow Me Home Headlights</Label>
              <Input
                value={formData.followMeHomeHeadlights}
                onChange={(e) => handleInputChange('followMeHomeHeadlights', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Keyless Entry</Label>
              <Input
                value={formData.keylessEntry}
                onChange={(e) => handleInputChange('keylessEntry', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Ignition</Label>
              <Input
                value={formData.ignition}
                onChange={(e) => handleInputChange('ignition', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Ambient Lighting</Label>
              <Input
                value={formData.ambientLighting}
                onChange={(e) => handleInputChange('ambientLighting', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Steering Adjustment</Label>
              <Input
                value={formData.steeringAdjustment}
                onChange={(e) => handleInputChange('steeringAdjustment', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Air Conditioning</Label>
              <Input
                value={formData.airConditioning}
                onChange={(e) => handleInputChange('airConditioning', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Climate Zones</Label>
              <Input
                value={formData.climateZones}
                onChange={(e) => handleInputChange('climateZones', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Rear A/C Vents</Label>
              <Input
                value={formData.rearACVents}
                onChange={(e) => handleInputChange('rearACVents', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Front Armrest</Label>
              <Input
                value={formData.frontArmrest}
                onChange={(e) => handleInputChange('frontArmrest', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Rear Armrest</Label>
              <Input
                value={formData.rearArmrest}
                onChange={(e) => handleInputChange('rearArmrest', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Inside rear view mirror</Label>
              <Input
                value={formData.insideRearViewMirror}
                onChange={(e) => handleInputChange('insideRearViewMirror', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Outside rear view mirrors</Label>
              <Input
                value={formData.outsideRearViewMirrors}
                onChange={(e) => handleInputChange('outsideRearViewMirrors', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Steering Mounted Controls</Label>
              <Input
                value={formData.steeringMountedControls}
                onChange={(e) => handleInputChange('steeringMountedControls', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Rear Windshield Defogger</Label>
              <Input
                value={formData.rearWindshieldDefogger}
                onChange={(e) => handleInputChange('rearWindshieldDefogger', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Front Windshield Defogger</Label>
              <Input
                value={formData.frontWindshieldDefogger}
                onChange={(e) => handleInputChange('frontWindshieldDefogger', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Cooled Glovebox</Label>
              <Input
                value={formData.cooledGlovebox}
                onChange={(e) => handleInputChange('cooledGlovebox', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setLocation(isEditMode ? `/variants/${params.id}/edit` : '/variants/new')}
          >
            ← Previous Page
          </Button>
          
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Data'}
            </Button>
            <Button onClick={handleNextPage} disabled={saveMutation.isPending}>
              Next Page →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
