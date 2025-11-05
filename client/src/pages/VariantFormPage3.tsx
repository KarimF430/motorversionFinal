import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Variant } from "@shared/schema";

export default function VariantFormPage3() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isEditMode = !!params.id;

  const { data: existingVariant } = useQuery<Variant>({
    queryKey: ['/api/variants', params.id],
    enabled: isEditMode && !!params.id,
  });

  const [formData, setFormData] = useState({
    // Safety Features
    globalNCAPRating: '',
    airbags: '',
    airbagsLocation: '',
    adasLevel: '',
    adasFeatures: '',
    reverseCamera: '',
    reverseCameraGuidelines: '',
    tyrePressureMonitor: '',
    hillHoldAssist: '',
    hillDescentControl: '',
    rollOverMitigation: '',
    parkingSensor: '',
    discBrakes: '',
    electronicStabilityProgram: '',
    abs: '',
    ebd: '',
    brakeAssist: '',
    isofixMounts: '',
    seatbeltWarning: '',
    speedAlertSystem: '',
    speedSensingDoorLocks: '',
    immobiliser: '',
    
    // Entertainment & Connectivity
    touchScreenInfotainment: '',
    androidAppleCarplay: '',
    speakers: '',
    tweeters: '',
    subwoofers: '',
    usbCChargingPorts: '',
    usbAChargingPorts: '',
    twelvevChargingPorts: '',
    wirelessCharging: '',
    connectedCarTech: '',
  });

  // Load existing variant data
  useEffect(() => {
    if (existingVariant) {
      setFormData({
        globalNCAPRating: existingVariant.globalNCAPRating || '',
        airbags: existingVariant.airbags || '',
        airbagsLocation: existingVariant.airbagsLocation || '',
        adasLevel: existingVariant.adasLevel || '',
        adasFeatures: existingVariant.adasFeatures || '',
        reverseCamera: existingVariant.reverseCamera || '',
        reverseCameraGuidelines: existingVariant.reverseCameraGuidelines || '',
        tyrePressureMonitor: existingVariant.tyrePressureMonitor || '',
        hillHoldAssist: existingVariant.hillHoldAssist || '',
        hillDescentControl: existingVariant.hillDescentControl || '',
        rollOverMitigation: existingVariant.rollOverMitigation || '',
        parkingSensor: existingVariant.parkingSensor || '',
        discBrakes: existingVariant.discBrakes || '',
        electronicStabilityProgram: existingVariant.electronicStabilityProgram || '',
        abs: existingVariant.abs || '',
        ebd: existingVariant.ebd || '',
        brakeAssist: existingVariant.brakeAssist || '',
        isofixMounts: existingVariant.isofixMounts || '',
        seatbeltWarning: existingVariant.seatbeltWarning || '',
        speedAlertSystem: existingVariant.speedAlertSystem || '',
        speedSensingDoorLocks: existingVariant.speedSensingDoorLocks || '',
        immobiliser: existingVariant.immobiliser || '',
        touchScreenInfotainment: existingVariant.touchScreenInfotainment || '',
        androidAppleCarplay: existingVariant.androidAppleCarplay || '',
        speakers: existingVariant.speakers || '',
        tweeters: existingVariant.tweeters || '',
        subwoofers: existingVariant.subwoofers || '',
        usbCChargingPorts: existingVariant.usbCChargingPorts || '',
        usbAChargingPorts: existingVariant.usbAChargingPorts || '',
        twelvevChargingPorts: existingVariant.twelvevChargingPorts || '',
        wirelessCharging: existingVariant.wirelessCharging || '',
        connectedCarTech: existingVariant.connectedCarTech || '',
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
        description: "Variant page 3 data saved successfully.",
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
      setLocation(`/variants/${params.id}/edit/page4`);
    } else {
      setLocation('/variants/new/page4');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Page 3</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-8">
        {/* Safety Features */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Safety</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Global NCAP Rating</Label>
              <Input
                value={formData.globalNCAPRating}
                onChange={(e) => handleInputChange('globalNCAPRating', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Airbags</Label>
              <Input
                value={formData.airbags}
                onChange={(e) => handleInputChange('airbags', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Airbags Location</Label>
              <Input
                value={formData.airbagsLocation}
                onChange={(e) => handleInputChange('airbagsLocation', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>ADAS Level</Label>
              <Input
                value={formData.adasLevel}
                onChange={(e) => handleInputChange('adasLevel', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>ADAS Features</Label>
              <Textarea
                value={formData.adasFeatures}
                onChange={(e) => handleInputChange('adasFeatures', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Reverse Camera</Label>
              <Input
                value={formData.reverseCamera}
                onChange={(e) => handleInputChange('reverseCamera', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Reverse Camera Guidelines</Label>
              <Input
                value={formData.reverseCameraGuidelines}
                onChange={(e) => handleInputChange('reverseCameraGuidelines', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Tyre pressure Monitor (TPMS)</Label>
              <Input
                value={formData.tyrePressureMonitor}
                onChange={(e) => handleInputChange('tyrePressureMonitor', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Hill Hold Assist</Label>
              <Input
                value={formData.hillHoldAssist}
                onChange={(e) => handleInputChange('hillHoldAssist', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Hill Descent Control</Label>
              <Input
                value={formData.hillDescentControl}
                onChange={(e) => handleInputChange('hillDescentControl', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Roll Over Mitigation</Label>
              <Input
                value={formData.rollOverMitigation}
                onChange={(e) => handleInputChange('rollOverMitigation', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Parking Sensor</Label>
              <Input
                value={formData.parkingSensor}
                onChange={(e) => handleInputChange('parkingSensor', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Disc Brakes</Label>
              <Input
                value={formData.discBrakes}
                onChange={(e) => handleInputChange('discBrakes', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Electronic stability program</Label>
              <Input
                value={formData.electronicStabilityProgram}
                onChange={(e) => handleInputChange('electronicStabilityProgram', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>ABS</Label>
              <Input
                value={formData.abs}
                onChange={(e) => handleInputChange('abs', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>EBD</Label>
              <Input
                value={formData.ebd}
                onChange={(e) => handleInputChange('ebd', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Brake assist (BA)</Label>
              <Input
                value={formData.brakeAssist}
                onChange={(e) => handleInputChange('brakeAssist', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>ISOFIX Mounts</Label>
              <Input
                value={formData.isofixMounts}
                onChange={(e) => handleInputChange('isofixMounts', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Seatbelt warning</Label>
              <Input
                value={formData.seatbeltWarning}
                onChange={(e) => handleInputChange('seatbeltWarning', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Speed Alert System</Label>
              <Input
                value={formData.speedAlertSystem}
                onChange={(e) => handleInputChange('speedAlertSystem', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Speed Sensing Door Locks</Label>
              <Input
                value={formData.speedSensingDoorLocks}
                onChange={(e) => handleInputChange('speedSensingDoorLocks', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Immobiliser</Label>
              <Input
                value={formData.immobiliser}
                onChange={(e) => handleInputChange('immobiliser', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Entertainment & Connectivity */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Entertainment & Connectivity</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Touch Screen Infotainment</Label>
              <Input
                value={formData.touchScreenInfotainment}
                onChange={(e) => handleInputChange('touchScreenInfotainment', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Android & Apple Carplay</Label>
              <Input
                value={formData.androidAppleCarplay}
                onChange={(e) => handleInputChange('androidAppleCarplay', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Speakers</Label>
              <Input
                value={formData.speakers}
                onChange={(e) => handleInputChange('speakers', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Tweeters</Label>
              <Input
                value={formData.tweeters}
                onChange={(e) => handleInputChange('tweeters', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Subwoofers</Label>
              <Textarea
                value={formData.subwoofers}
                onChange={(e) => handleInputChange('subwoofers', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>USB-C Charging Ports</Label>
              <Input
                value={formData.usbCChargingPorts}
                onChange={(e) => handleInputChange('usbCChargingPorts', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>USB-A Charging Ports</Label>
              <Input
                value={formData.usbAChargingPorts}
                onChange={(e) => handleInputChange('usbAChargingPorts', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>12V Charging Ports</Label>
              <Input
                value={formData.twelvevChargingPorts}
                onChange={(e) => handleInputChange('twelvevChargingPorts', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Wireless Charging</Label>
              <Input
                value={formData.wirelessCharging}
                onChange={(e) => handleInputChange('wirelessCharging', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Connected Car Tech</Label>
              <Input
                value={formData.connectedCarTech}
                onChange={(e) => handleInputChange('connectedCarTech', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setLocation(isEditMode ? `/variants/${params.id}/edit/page2` : '/variants/new/page2')}
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
