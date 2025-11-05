import React, { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Upload, ChevronDown, Edit, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { downloadVariantsCSV, parseCSVFile, validateCSVData, ValidationError } from "@/utils/csvUtils";
import type { Variant, Model, Brand } from "@shared/schema";

export default function VariantList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModelId, setSelectedModelId] = useState<string>('all');
  const [uploadErrors, setUploadErrors] = useState<ValidationError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear any stale cache on component mount
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/variants'] });
  }, []);

  const { data: variants = [], isLoading, error } = useQuery<Variant[]>({
    queryKey: ['/api/variants'],
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
  });

  // Debug logging
  console.log('Variants loaded:', variants);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await apiRequest('DELETE', `/api/variants/${id}`);
      } catch (error: any) {
        // If variant doesn't exist (404), consider it already deleted
        if (error.status === 404) {
          console.warn(`Variant ${id} not found, considering it already deleted`);
          return { success: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/variants'] });
      toast({
        title: "Success",
        description: "Variant deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete variant.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteVariant.mutate(id);
    }
  };

  // Filter variants based on selected model
  const filteredVariants = useMemo(() => {
    if (selectedModelId === 'all') return variants;
    return variants.filter(variant => variant.modelId === selectedModelId);
  }, [variants, selectedModelId]);

  // Group variants by model
  const variantsByModel = useMemo(() => {
    const grouped: Record<string, Variant[]> = {};
    filteredVariants.forEach(variant => {
      if (!grouped[variant.modelId]) {
        grouped[variant.modelId] = [];
      }
      grouped[variant.modelId].push(variant);
    });
    return grouped;
  }, [filteredVariants]);

  // Get model and brand info
  const getModelInfo = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return { modelName: 'Unknown', brandName: 'Unknown' };
    const brand = brands.find(b => b.id === model.brandId);
    return {
      modelName: model.name,
      brandName: brand?.name || 'Unknown'
    };
  };

  // CSV Upload mutation
  const uploadVariantsMutation = useMutation({
    mutationFn: async (variantsData: any[]) => {
      const results = [];
      for (const variant of variantsData) {
        try {
          if (variant.variantId && variant.variantId !== '') {
            // Update existing variant - remove variantId from the data payload
            const { variantId, ...updateData } = variant;
            const result = await apiRequest('PATCH', `/api/variants/${variantId}`, updateData);
            results.push({ success: true, action: 'updated', data: result, variantId });
          } else {
            // Create new variant - remove variantId field if it exists
            const { variantId, ...createData } = variant;
            const result = await apiRequest('POST', '/api/variants', createData);
            results.push({ success: true, action: 'created', data: result });
          }
        } catch (error: any) {
          results.push({ 
            success: false, 
            action: variant.variantId ? 'update' : 'create', 
            error: error.message,
            data: variant 
          });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const updated = results.filter(r => r.success && r.action === 'updated').length;
      const created = results.filter(r => r.success && r.action === 'created').length;
      
      queryClient.invalidateQueries({ queryKey: ['/api/variants'] });
      
      let description = '';
      if (updated > 0 && created > 0) {
        description = `${updated} variants updated, ${created} variants created`;
      } else if (updated > 0) {
        description = `${updated} variants updated`;
      } else if (created > 0) {
        description = `${created} variants created`;
      } else {
        description = `${successful} variants processed`;
      }
      
      if (failed > 0) {
        description += `, ${failed} failed`;
      }
      
      toast({
        title: "CSV Upload Complete",
        description: description + '.',
      });
      
      if (failed > 0) {
        console.error('Failed uploads:', results.filter(r => !r.success));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CSV data.",
        variant: "destructive",
      });
    },
  });

  const handleDownloadCSV = () => {
    try {
      downloadVariantsCSV(variants, brands, models);
      toast({
        title: "CSV Downloaded",
        description: "Variants data has been exported to CSV file.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download CSV.",
        variant: "destructive",
      });
    }
  };

  const handleUploadCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);

    try {
      // Parse CSV file
      const csvData = await parseCSVFile(file);
      
      // Validate data
      const errors = validateCSVData(csvData, brands, models);
      
      if (errors.length > 0) {
        setUploadErrors(errors);
        toast({
          title: "Validation Errors",
          description: `Found ${errors.length} validation errors. Please check the error details below.`,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Transform CSV data to variant format
      const variantsData = csvData.map((row: any) => {
        const variantData: any = {
        brandId: row.brandId,
        modelId: row.modelId,
        name: row.variantName,
        status: row.status || 'active',
        isValueForMoney: ['true', '1', 'yes'].includes(row.isValueForMoney?.toString().toLowerCase()) || false,
        price: parseFloat(row.price) || 0,
        keyFeatures: row.keyFeatures || '',
        headerSummary: row.headerSummary || '',
        description: row.description || '',
        exteriorDesign: row.exteriorDesign || '',
        comfortConvenience: row.comfortConvenience || '',
        
        // Page 2 fields
        engineName: row.engineName || '',
        engineSummary: row.engineSummary || '',
        engineTransmission: row.engineTransmission || '',
        enginePower: row.enginePower || '',
        engineTorque: row.engineTorque || '',
        engineSpeed: row.engineSpeed || '',
        mileageEngineName: row.mileageEngineName || '',
        mileageCompanyClaimed: row.mileageCompanyClaimed || '',
        mileageCityRealWorld: row.mileageCityRealWorld || '',
        mileageHighwayRealWorld: row.mileageHighwayRealWorld || '',
        ventilatedSeats: row.ventilatedSeats || '',
        sunroof: row.sunroof || '',
        airPurifier: row.airPurifier || '',
        headsUpDisplay: row.headsUpDisplay || '',
        cruiseControl: row.cruiseControl || '',
        rainSensingWipers: row.rainSensingWipers || '',
        automaticHeadlamp: row.automaticHeadlamp || '',
        followMeHomeHeadlights: row.followMeHomeHeadlights || '',
        keylessEntry: row.keylessEntry || '',
        ignition: row.ignition || '',
        ambientLighting: row.ambientLighting || '',
        steeringAdjustment: row.steeringAdjustment || '',
        airConditioning: row.airConditioning || '',
        climateZones: row.climateZones || '',
        rearACVents: row.rearACVents || '',
        frontArmrest: row.frontArmrest || '',
        rearArmrest: row.rearArmrest || '',
        insideRearViewMirror: row.insideRearViewMirror || '',
        outsideRearViewMirrors: row.outsideRearViewMirrors || '',
        steeringMountedControls: row.steeringMountedControls || '',
        rearWindshieldDefogger: row.rearWindshieldDefogger || '',
        frontWindshieldDefogger: row.frontWindshieldDefogger || '',
        cooledGlovebox: row.cooledGlovebox || '',
        
        // Page 3 fields
        globalNCAPRating: row.globalNCAPRating || '',
        airbags: row.airbags || '',
        airbagsLocation: row.airbagsLocation || '',
        adasLevel: row.adasLevel || '',
        adasFeatures: row.adasFeatures || '',
        reverseCamera: row.reverseCamera || '',
        reverseCameraGuidelines: row.reverseCameraGuidelines || '',
        tyrePressureMonitor: row.tyrePressureMonitor || '',
        hillHoldAssist: row.hillHoldAssist || '',
        hillDescentControl: row.hillDescentControl || '',
        rollOverMitigation: row.rollOverMitigation || '',
        parkingSensor: row.parkingSensor || '',
        discBrakes: row.discBrakes || '',
        electronicStabilityProgram: row.electronicStabilityProgram || '',
        abs: row.abs || '',
        ebd: row.ebd || '',
        brakeAssist: row.brakeAssist || '',
        isofixMounts: row.isofixMounts || '',
        seatbeltWarning: row.seatbeltWarning || '',
        speedAlertSystem: row.speedAlertSystem || '',
        speedSensingDoorLocks: row.speedSensingDoorLocks || '',
        immobiliser: row.immobiliser || '',
        touchScreenInfotainment: row.touchScreenInfotainment || '',
        androidAppleCarplay: row.androidAppleCarplay || '',
        speakers: row.speakers || '',
        tweeters: row.tweeters || '',
        subwoofers: row.subwoofers || '',
        usbCChargingPorts: row.usbCChargingPorts || '',
        usbAChargingPorts: row.usbAChargingPorts || '',
        twelvevChargingPorts: row.twelvevChargingPorts || '',
        wirelessCharging: row.wirelessCharging || '',
        connectedCarTech: row.connectedCarTech || '',
        
        // Page 4 fields
        engineNamePage4: row.engineNamePage4 || '',
        engineCapacity: row.engineCapacity || '',
        fuel: row.fuel || '',
        transmission: row.transmission || '',
        noOfGears: row.noOfGears || '',
        paddleShifter: row.paddleShifter || '',
        maxPower: row.maxPower || '',
        torque: row.torque || '',
        zeroTo100KmphTime: row.zeroTo100KmphTime || '',
        topSpeed: row.topSpeed || '',
        evBatteryCapacity: row.evBatteryCapacity || '',
        hybridBatteryCapacity: row.hybridBatteryCapacity || '',
        batteryType: row.batteryType || '',
        electricMotorPlacement: row.electricMotorPlacement || '',
        evRange: row.evRange || '',
        evChargingTime: row.evChargingTime || '',
        maxElectricMotorPower: row.maxElectricMotorPower || '',
        turboCharged: row.turboCharged || '',
        hybridType: row.hybridType || '',
        driveTrain: row.driveTrain || '',
        drivingModes: row.drivingModes || '',
        offRoadModes: row.offRoadModes || '',
        differentialLock: row.differentialLock || '',
        limitedSlipDifferential: row.limitedSlipDifferential || '',
        seatUpholstery: row.seatUpholstery || '',
        seatsAdjustment: row.seatsAdjustment || '',
        driverSeatAdjustment: row.driverSeatAdjustment || '',
        passengerSeatAdjustment: row.passengerSeatAdjustment || '',
        rearSeatAdjustment: row.rearSeatAdjustment || '',
        welcomeSeats: row.welcomeSeats || '',
        memorySeats: row.memorySeats || '',
        headLights: row.headLights || '',
        tailLight: row.tailLight || '',
        frontFogLights: row.frontFogLights || '',
        roofRails: row.roofRails || '',
        radioAntenna: row.radioAntenna || '',
        outsideRearViewMirror: row.outsideRearViewMirror || '',
        daytimeRunningLights: row.daytimeRunningLights || '',
        sideIndicator: row.sideIndicator || '',
        rearWindshieldWiper: row.rearWindshieldWiper || '',
        
        // Page 5 fields
        groundClearance: row.groundClearance || '',
        length: row.length || '',
        width: row.width || '',
        height: row.height || '',
        wheelbase: row.wheelbase || '',
        turningRadius: row.turningRadius || '',
        kerbWeight: row.kerbWeight || '',
        frontTyreProfile: row.frontTyreProfile || '',
        rearTyreProfile: row.rearTyreProfile || '',
        spareTyreProfile: row.spareTyreProfile || '',
        spareWheelType: row.spareWheelType || '',
        frontSuspension: row.frontSuspension || '',
        rearSuspension: row.rearSuspension || '',
        cupholders: row.cupholders || '',
        fuelTankCapacity: row.fuelTankCapacity || '',
        bootSpace: row.bootSpace || '',
        bootSpaceAfterFoldingRearRowSeats: row.bootSpaceAfterFoldingRearRowSeats || '',
        };

        // Add variant ID if it exists for updates, otherwise it's a new variant
        if (row.variantId && row.variantId.trim() !== '') {
          variantData.variantId = row.variantId.trim();
        }

        return variantData;
      });

      // Upload the data
      uploadVariantsMutation.mutate(variantsData);

    } catch (error: any) {
      toast({
        title: "File Processing Error",
        description: error.message || "Failed to process CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit Variants</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Edit Variants</h1>
          
          {/* Model Filter Dropdown */}
          <div className="relative">
            <select 
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="px-3 py-1.5 pr-8 border rounded-md text-sm bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Models</option>
              {models.map((model) => {
                const brand = brands.find(b => b.id === model.brandId);
                return (
                  <option key={model.id} value={model.id}>
                    {brand?.name} {model.name}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setLocation('/variants/new')} className="bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Add/Edit Variants
          </Button>
          <Button onClick={handleDownloadCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={handleUploadCSV} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
      />

      {/* Upload Status */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Processing CSV file...</span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Validation Errors Found</h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadErrors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 bg-red-100 rounded p-2">
                <strong>Row {error.row}, Field "{error.field}":</strong> {error.error}
                {error.value && <span className="text-red-600"> (Value: "{error.value}")</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-red-600">
            Please fix these errors in your CSV file and try uploading again.
          </div>
        </div>
      )}

      {/* Variants Grid by Model */}
      <div className="space-y-8">
        {Object.keys(variantsByModel).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No variants found. Create your first variant to get started.
          </div>
        ) : (
          Object.entries(variantsByModel).map(([modelId, modelVariants]) => {
            const { modelName, brandName } = getModelInfo(modelId);
            
            return (
              <div key={modelId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{brandName} {modelName} Variants</h2>
                  <Button 
                    onClick={() => setLocation('/variants/new')} 
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Variant
                  </Button>
                </div>

                {/* Variants Table */}
                <div className="space-y-3">
                  {modelVariants.map((variant, index) => (
                    <div 
                      key={variant.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <span className="text-lg font-semibold text-gray-700 w-16">
                          {index + 1}. {variant.name}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {variant.fuelType || 'Petrol'}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {variant.transmission || 'Manual'}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded text-sm font-semibold">
                          ₹{variant.price?.toLocaleString('en-IN') || '0'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLocation(`/variants/${variant.id}/edit`)}
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(variant.id, variant.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end pt-4">
        <Button variant="ghost" size="icon">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
