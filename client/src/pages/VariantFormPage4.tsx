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

export default function VariantFormPage4() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isEditMode = !!params.id;

  const { data: existingVariant } = useQuery<Variant>({
    queryKey: ['/api/variants', params.id],
    enabled: isEditMode && !!params.id,
  });

  const [formData, setFormData] = useState({
    // Engine & Transmission (Additional fields for Page 4)
    engineNamePage4: '',
    engineCapacity: '',
    fuel: '',
    transmission: '',
    noOfGears: '',
    paddleShifter: '',
    maxPower: '',
    torque: '',
    zeroTo100KmphTime: '',
    topSpeed: '',
    evBatteryCapacity: '',
    hybridBatteryCapacity: '',
    batteryType: '',
    electricMotorPlacement: '',
    evRange: '',
    evChargingTime: '',
    maxElectricMotorPower: '',
    turboCharged: '',
    hybridType: '',
    driveTrain: '',
    drivingModes: '',
    offRoadModes: '',
    differentialLock: '',
    limitedSlipDifferential: '',
    
    // Seating Comfort
    seatUpholstery: '',
    seatsAdjustment: '',
    driverSeatAdjustment: '',
    passengerSeatAdjustment: '',
    rearSeatAdjustment: '',
    welcomeSeats: '',
    memorySeats: '',
    
    // Exteriors
    headLights: '',
    tailLight: '',
    frontFogLights: '',
    roofRails: '',
    radioAntenna: '',
    outsideRearViewMirror: '',
    daytimeRunningLights: '',
    sideIndicator: '',
    rearWindshieldWiper: '',
  });

  // Load existing variant data
  useEffect(() => {
    if (existingVariant) {
      setFormData({
        engineNamePage4: (existingVariant as any).engineNamePage4 || '',
        engineCapacity: (existingVariant as any).engineCapacity || '',
        fuel: (existingVariant as any).fuel || '',
        transmission: (existingVariant as any).transmission || '',
        noOfGears: (existingVariant as any).noOfGears || '',
        paddleShifter: (existingVariant as any).paddleShifter || '',
        maxPower: (existingVariant as any).maxPower || '',
        torque: (existingVariant as any).torque || '',
        zeroTo100KmphTime: (existingVariant as any).zeroTo100KmphTime || '',
        topSpeed: (existingVariant as any).topSpeed || '',
        evBatteryCapacity: (existingVariant as any).evBatteryCapacity || '',
        hybridBatteryCapacity: (existingVariant as any).hybridBatteryCapacity || '',
        batteryType: (existingVariant as any).batteryType || '',
        electricMotorPlacement: (existingVariant as any).electricMotorPlacement || '',
        evRange: (existingVariant as any).evRange || '',
        evChargingTime: (existingVariant as any).evChargingTime || '',
        maxElectricMotorPower: (existingVariant as any).maxElectricMotorPower || '',
        turboCharged: (existingVariant as any).turboCharged || '',
        hybridType: (existingVariant as any).hybridType || '',
        driveTrain: (existingVariant as any).driveTrain || '',
        drivingModes: (existingVariant as any).drivingModes || '',
        offRoadModes: (existingVariant as any).offRoadModes || '',
        differentialLock: (existingVariant as any).differentialLock || '',
        limitedSlipDifferential: (existingVariant as any).limitedSlipDifferential || '',
        seatUpholstery: (existingVariant as any).seatUpholstery || '',
        seatsAdjustment: (existingVariant as any).seatsAdjustment || '',
        driverSeatAdjustment: (existingVariant as any).driverSeatAdjustment || '',
        passengerSeatAdjustment: (existingVariant as any).passengerSeatAdjustment || '',
        rearSeatAdjustment: (existingVariant as any).rearSeatAdjustment || '',
        welcomeSeats: (existingVariant as any).welcomeSeats || '',
        memorySeats: (existingVariant as any).memorySeats || '',
        headLights: (existingVariant as any).headLights || '',
        tailLight: (existingVariant as any).tailLight || '',
        frontFogLights: (existingVariant as any).frontFogLights || '',
        roofRails: (existingVariant as any).roofRails || '',
        radioAntenna: (existingVariant as any).radioAntenna || '',
        outsideRearViewMirror: (existingVariant as any).outsideRearViewMirror || '',
        daytimeRunningLights: (existingVariant as any).daytimeRunningLights || '',
        sideIndicator: (existingVariant as any).sideIndicator || '',
        rearWindshieldWiper: (existingVariant as any).rearWindshieldWiper || '',
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
        description: "Variant page 4 data saved successfully.",
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
      setLocation(`/variants/${params.id}/edit/page5`);
    } else {
      setLocation('/variants/new/page5');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Page 4</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-8">
        {/* Engine & Transmission */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Engine & Transmission</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Engine Name</Label>
              <Input
                value={formData.engineNamePage4}
                onChange={(e) => handleInputChange('engineNamePage4', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Engine Capacity</Label>
              <Input
                value={formData.engineCapacity}
                onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Fuel</Label>
              <Input
                value={formData.fuel}
                onChange={(e) => handleInputChange('fuel', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Transmission</Label>
              <Input
                value={formData.transmission}
                onChange={(e) => handleInputChange('transmission', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>No of Gears</Label>
              <Textarea
                value={formData.noOfGears}
                onChange={(e) => handleInputChange('noOfGears', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Paddle Shifter</Label>
              <Input
                value={formData.paddleShifter}
                onChange={(e) => handleInputChange('paddleShifter', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Power</Label>
              <Input
                value={formData.maxPower}
                onChange={(e) => handleInputChange('maxPower', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Torque</Label>
              <Input
                value={formData.torque}
                onChange={(e) => handleInputChange('torque', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>0 to 100 Kmph Time</Label>
              <Input
                value={formData.zeroTo100KmphTime}
                onChange={(e) => handleInputChange('zeroTo100KmphTime', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Top Speed</Label>
              <Input
                value={formData.topSpeed}
                onChange={(e) => handleInputChange('topSpeed', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>EV Battery Capacity</Label>
              <Input
                value={formData.evBatteryCapacity}
                onChange={(e) => handleInputChange('evBatteryCapacity', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Hybrid Battery Capacity</Label>
              <Input
                value={formData.hybridBatteryCapacity}
                onChange={(e) => handleInputChange('hybridBatteryCapacity', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Battery Type</Label>
              <Input
                value={formData.batteryType}
                onChange={(e) => handleInputChange('batteryType', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Electric Motor Placement</Label>
              <Input
                value={formData.electricMotorPlacement}
                onChange={(e) => handleInputChange('electricMotorPlacement', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>EV Range</Label>
              <Input
                value={formData.evRange}
                onChange={(e) => handleInputChange('evRange', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>EV Charging Time</Label>
              <Input
                value={formData.evChargingTime}
                onChange={(e) => handleInputChange('evChargingTime', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Electric Motor Power</Label>
              <Input
                value={formData.maxElectricMotorPower}
                onChange={(e) => handleInputChange('maxElectricMotorPower', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Turbo Charged</Label>
              <Input
                value={formData.turboCharged}
                onChange={(e) => handleInputChange('turboCharged', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Hybrid Type</Label>
              <Input
                value={formData.hybridType}
                onChange={(e) => handleInputChange('hybridType', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Drive Train</Label>
              <Input
                value={formData.driveTrain}
                onChange={(e) => handleInputChange('driveTrain', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Driving Modes</Label>
              <Input
                value={formData.drivingModes}
                onChange={(e) => handleInputChange('drivingModes', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Off Road Modes</Label>
              <Input
                value={formData.offRoadModes}
                onChange={(e) => handleInputChange('offRoadModes', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Differential Lock</Label>
              <Input
                value={formData.differentialLock}
                onChange={(e) => handleInputChange('differentialLock', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Limited Slip Differential</Label>
              <Input
                value={formData.limitedSlipDifferential}
                onChange={(e) => handleInputChange('limitedSlipDifferential', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Seating Comfort */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Seating Comfort</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Seat Upholstery</Label>
              <Input
                value={formData.seatUpholstery}
                onChange={(e) => handleInputChange('seatUpholstery', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Seats Adjustment</Label>
              <Input
                value={formData.seatsAdjustment}
                onChange={(e) => handleInputChange('seatsAdjustment', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Driver Seat Adjustment</Label>
              <Input
                value={formData.driverSeatAdjustment}
                onChange={(e) => handleInputChange('driverSeatAdjustment', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Passenger Seat Adjustment</Label>
              <Input
                value={formData.passengerSeatAdjustment}
                onChange={(e) => handleInputChange('passengerSeatAdjustment', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Rear Seat Adjustment</Label>
              <Textarea
                value={formData.rearSeatAdjustment}
                onChange={(e) => handleInputChange('rearSeatAdjustment', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Welcome Seats</Label>
              <Input
                value={formData.welcomeSeats}
                onChange={(e) => handleInputChange('welcomeSeats', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Memory Seats</Label>
              <Input
                value={formData.memorySeats}
                onChange={(e) => handleInputChange('memorySeats', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Exteriors */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center">Specifications and Features</h2>
          <h3 className="text-lg font-medium">Exteriors</h3>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Head Lights</Label>
              <Input
                value={formData.headLights}
                onChange={(e) => handleInputChange('headLights', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Tail Light</Label>
              <Input
                value={formData.tailLight}
                onChange={(e) => handleInputChange('tailLight', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Front Fog Lights</Label>
              <Input
                value={formData.frontFogLights}
                onChange={(e) => handleInputChange('frontFogLights', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Roof Rails</Label>
              <Input
                value={formData.roofRails}
                onChange={(e) => handleInputChange('roofRails', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Radio Antenna</Label>
              <Textarea
                value={formData.radioAntenna}
                onChange={(e) => handleInputChange('radioAntenna', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Outside rear view mirror</Label>
              <Input
                value={formData.outsideRearViewMirror}
                onChange={(e) => handleInputChange('outsideRearViewMirror', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Day time running lights (DRL's)</Label>
              <Input
                value={formData.daytimeRunningLights}
                onChange={(e) => handleInputChange('daytimeRunningLights', e.target.value)}
                placeholder="Text Box"
              />
            </div>

            <div className="space-y-2">
              <Label>Side Indicator</Label>
              <Textarea
                value={formData.sideIndicator}
                onChange={(e) => handleInputChange('sideIndicator', e.target.value)}
                placeholder="Long Text Box"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Rear Windshield Wiper / Washer</Label>
              <Input
                value={formData.rearWindshieldWiper}
                onChange={(e) => handleInputChange('rearWindshieldWiper', e.target.value)}
                placeholder="Text Box"
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setLocation(isEditMode ? `/variants/${params.id}/edit/page3` : '/variants/new/page3')}
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
