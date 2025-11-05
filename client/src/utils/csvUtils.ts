import Papa from 'papaparse';

export interface CSVVariant {
  // Basic Info
  variantId: string;
  variantName: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  status: string;
  isValueForMoney: boolean;
  price: number;
  keyFeatures: string;
  headerSummary: string;
  description: string;
  exteriorDesign: string;
  comfortConvenience: string;

  // Page 2 Fields
  engineName: string;
  engineSummary: string;
  engineTransmission: string;
  enginePower: string;
  engineTorque: string;
  engineSpeed: string;
  mileageEngineName: string;
  mileageCompanyClaimed: string;
  mileageCityRealWorld: string;
  mileageHighwayRealWorld: string;
  ventilatedSeats: string;
  sunroof: string;
  airPurifier: string;
  headsUpDisplay: string;
  cruiseControl: string;
  rainSensingWipers: string;
  automaticHeadlamp: string;
  followMeHomeHeadlights: string;
  keylessEntry: string;
  ignition: string;
  ambientLighting: string;
  steeringAdjustment: string;
  airConditioning: string;
  climateZones: string;
  rearACVents: string;
  frontArmrest: string;
  rearArmrest: string;
  insideRearViewMirror: string;
  outsideRearViewMirrors: string;
  steeringMountedControls: string;
  rearWindshieldDefogger: string;
  frontWindshieldDefogger: string;
  cooledGlovebox: string;

  // Page 3 Fields
  globalNCAPRating: string;
  airbags: string;
  airbagsLocation: string;
  adasLevel: string;
  adasFeatures: string;
  reverseCamera: string;
  reverseCameraGuidelines: string;
  tyrePressureMonitor: string;
  hillHoldAssist: string;
  hillDescentControl: string;
  rollOverMitigation: string;
  parkingSensor: string;
  discBrakes: string;
  electronicStabilityProgram: string;
  abs: string;
  ebd: string;
  brakeAssist: string;
  isofixMounts: string;
  seatbeltWarning: string;
  speedAlertSystem: string;
  speedSensingDoorLocks: string;
  immobiliser: string;
  touchScreenInfotainment: string;
  androidAppleCarplay: string;
  speakers: string;
  tweeters: string;
  subwoofers: string;
  usbCChargingPorts: string;
  usbAChargingPorts: string;
  twelvevChargingPorts: string;
  wirelessCharging: string;
  connectedCarTech: string;

  // Page 4 Fields
  engineNamePage4: string;
  engineCapacity: string;
  fuel: string;
  transmission: string;
  noOfGears: string;
  paddleShifter: string;
  maxPower: string;
  torque: string;
  zeroTo100KmphTime: string;
  topSpeed: string;
  evBatteryCapacity: string;
  hybridBatteryCapacity: string;
  batteryType: string;
  electricMotorPlacement: string;
  evRange: string;
  evChargingTime: string;
  maxElectricMotorPower: string;
  turboCharged: string;
  hybridType: string;
  driveTrain: string;
  drivingModes: string;
  offRoadModes: string;
  differentialLock: string;
  limitedSlipDifferential: string;
  seatUpholstery: string;
  seatsAdjustment: string;
  driverSeatAdjustment: string;
  passengerSeatAdjustment: string;
  rearSeatAdjustment: string;
  welcomeSeats: string;
  memorySeats: string;
  headLights: string;
  tailLight: string;
  frontFogLights: string;
  roofRails: string;
  radioAntenna: string;
  outsideRearViewMirror: string;
  daytimeRunningLights: string;
  sideIndicator: string;
  rearWindshieldWiper: string;

  // Page 5 Fields
  groundClearance: string;
  length: string;
  width: string;
  height: string;
  wheelbase: string;
  turningRadius: string;
  kerbWeight: string;
  frontTyreProfile: string;
  rearTyreProfile: string;
  spareTyreProfile: string;
  spareWheelType: string;
  frontSuspension: string;
  rearSuspension: string;
  cupholders: string;
  fuelTankCapacity: string;
  bootSpace: string;
  bootSpaceAfterFoldingRearRowSeats: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export const downloadVariantsCSV = (variants: any[], brands: any[], models: any[]) => {
  const csvData: CSVVariant[] = variants.map((variant) => {
    const brand = brands.find((b) => b.id === variant.brandId);
    const model = models.find((m) => m.id === variant.modelId);

    return {
      variantId: variant.id || '',
      variantName: variant.name || '',
      brandId: variant.brandId || '',
      brandName: brand?.name || '',
      modelId: variant.modelId || '',
      modelName: model?.name || '',
      status: variant.status || '',
      isValueForMoney: variant.isValueForMoney || false,
      price: variant.price || 0,
      keyFeatures: variant.keyFeatures || '',
      headerSummary: variant.headerSummary || '',
      description: variant.description || '',
      exteriorDesign: variant.exteriorDesign || '',
      comfortConvenience: variant.comfortConvenience || '',

      // Page 2
      engineName: variant.engineName || '',
      engineSummary: variant.engineSummary || '',
      engineTransmission: variant.engineTransmission || '',
      enginePower: variant.enginePower || '',
      engineTorque: variant.engineTorque || '',
      engineSpeed: variant.engineSpeed || '',
      mileageEngineName: variant.mileageEngineName || '',
      mileageCompanyClaimed: variant.mileageCompanyClaimed || '',
      mileageCityRealWorld: variant.mileageCityRealWorld || '',
      mileageHighwayRealWorld: variant.mileageHighwayRealWorld || '',
      ventilatedSeats: variant.ventilatedSeats || '',
      sunroof: variant.sunroof || '',
      airPurifier: variant.airPurifier || '',
      headsUpDisplay: variant.headsUpDisplay || '',
      cruiseControl: variant.cruiseControl || '',
      rainSensingWipers: variant.rainSensingWipers || '',
      automaticHeadlamp: variant.automaticHeadlamp || '',
      followMeHomeHeadlights: variant.followMeHomeHeadlights || '',
      keylessEntry: variant.keylessEntry || '',
      ignition: variant.ignition || '',
      ambientLighting: variant.ambientLighting || '',
      steeringAdjustment: variant.steeringAdjustment || '',
      airConditioning: variant.airConditioning || '',
      climateZones: variant.climateZones || '',
      rearACVents: variant.rearACVents || '',
      frontArmrest: variant.frontArmrest || '',
      rearArmrest: variant.rearArmrest || '',
      insideRearViewMirror: variant.insideRearViewMirror || '',
      outsideRearViewMirrors: variant.outsideRearViewMirrors || '',
      steeringMountedControls: variant.steeringMountedControls || '',
      rearWindshieldDefogger: variant.rearWindshieldDefogger || '',
      frontWindshieldDefogger: variant.frontWindshieldDefogger || '',
      cooledGlovebox: variant.cooledGlovebox || '',

      // Page 3
      globalNCAPRating: variant.globalNCAPRating || '',
      airbags: variant.airbags || '',
      airbagsLocation: variant.airbagsLocation || '',
      adasLevel: variant.adasLevel || '',
      adasFeatures: variant.adasFeatures || '',
      reverseCamera: variant.reverseCamera || '',
      reverseCameraGuidelines: variant.reverseCameraGuidelines || '',
      tyrePressureMonitor: variant.tyrePressureMonitor || '',
      hillHoldAssist: variant.hillHoldAssist || '',
      hillDescentControl: variant.hillDescentControl || '',
      rollOverMitigation: variant.rollOverMitigation || '',
      parkingSensor: variant.parkingSensor || '',
      discBrakes: variant.discBrakes || '',
      electronicStabilityProgram: variant.electronicStabilityProgram || '',
      abs: variant.abs || '',
      ebd: variant.ebd || '',
      brakeAssist: variant.brakeAssist || '',
      isofixMounts: variant.isofixMounts || '',
      seatbeltWarning: variant.seatbeltWarning || '',
      speedAlertSystem: variant.speedAlertSystem || '',
      speedSensingDoorLocks: variant.speedSensingDoorLocks || '',
      immobiliser: variant.immobiliser || '',
      touchScreenInfotainment: variant.touchScreenInfotainment || '',
      androidAppleCarplay: variant.androidAppleCarplay || '',
      speakers: variant.speakers || '',
      tweeters: variant.tweeters || '',
      subwoofers: variant.subwoofers || '',
      usbCChargingPorts: variant.usbCChargingPorts || '',
      usbAChargingPorts: variant.usbAChargingPorts || '',
      twelvevChargingPorts: variant.twelvevChargingPorts || '',
      wirelessCharging: variant.wirelessCharging || '',
      connectedCarTech: variant.connectedCarTech || '',

      // Page 4
      engineNamePage4: variant.engineNamePage4 || '',
      engineCapacity: variant.engineCapacity || '',
      fuel: variant.fuel || '',
      transmission: variant.transmission || '',
      noOfGears: variant.noOfGears || '',
      paddleShifter: variant.paddleShifter || '',
      maxPower: variant.maxPower || '',
      torque: variant.torque || '',
      zeroTo100KmphTime: variant.zeroTo100KmphTime || '',
      topSpeed: variant.topSpeed || '',
      evBatteryCapacity: variant.evBatteryCapacity || '',
      hybridBatteryCapacity: variant.hybridBatteryCapacity || '',
      batteryType: variant.batteryType || '',
      electricMotorPlacement: variant.electricMotorPlacement || '',
      evRange: variant.evRange || '',
      evChargingTime: variant.evChargingTime || '',
      maxElectricMotorPower: variant.maxElectricMotorPower || '',
      turboCharged: variant.turboCharged || '',
      hybridType: variant.hybridType || '',
      driveTrain: variant.driveTrain || '',
      drivingModes: variant.drivingModes || '',
      offRoadModes: variant.offRoadModes || '',
      differentialLock: variant.differentialLock || '',
      limitedSlipDifferential: variant.limitedSlipDifferential || '',
      seatUpholstery: variant.seatUpholstery || '',
      seatsAdjustment: variant.seatsAdjustment || '',
      driverSeatAdjustment: variant.driverSeatAdjustment || '',
      passengerSeatAdjustment: variant.passengerSeatAdjustment || '',
      rearSeatAdjustment: variant.rearSeatAdjustment || '',
      welcomeSeats: variant.welcomeSeats || '',
      memorySeats: variant.memorySeats || '',
      headLights: variant.headLights || '',
      tailLight: variant.tailLight || '',
      frontFogLights: variant.frontFogLights || '',
      roofRails: variant.roofRails || '',
      radioAntenna: variant.radioAntenna || '',
      outsideRearViewMirror: variant.outsideRearViewMirror || '',
      daytimeRunningLights: variant.daytimeRunningLights || '',
      sideIndicator: variant.sideIndicator || '',
      rearWindshieldWiper: variant.rearWindshieldWiper || '',

      // Page 5
      groundClearance: variant.groundClearance || '',
      length: variant.length || '',
      width: variant.width || '',
      height: variant.height || '',
      wheelbase: variant.wheelbase || '',
      turningRadius: variant.turningRadius || '',
      kerbWeight: variant.kerbWeight || '',
      frontTyreProfile: variant.frontTyreProfile || '',
      rearTyreProfile: variant.rearTyreProfile || '',
      spareTyreProfile: variant.spareTyreProfile || '',
      spareWheelType: variant.spareWheelType || '',
      frontSuspension: variant.frontSuspension || '',
      rearSuspension: variant.rearSuspension || '',
      cupholders: variant.cupholders || '',
      fuelTankCapacity: variant.fuelTankCapacity || '',
      bootSpace: variant.bootSpace || '',
      bootSpaceAfterFoldingRearRowSeats: variant.bootSpaceAfterFoldingRearRowSeats || '',
    };
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `variants_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateCSVData = (data: any[], brands: any[], models: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because CSV has header row and arrays are 0-indexed

    // Required field validations
    if (!row.variantName?.trim()) {
      errors.push({
        row: rowNum,
        field: 'variantName',
        value: row.variantName,
        error: 'Variant name is required',
      });
    }

    if (!row.brandId?.trim()) {
      errors.push({
        row: rowNum,
        field: 'brandId',
        value: row.brandId,
        error: 'Brand ID is required',
      });
    } else {
      const brandExists = brands.find((b) => b.id === row.brandId);
      if (!brandExists) {
        errors.push({
          row: rowNum,
          field: 'brandId',
          value: row.brandId,
          error: 'Brand ID does not exist',
        });
      }
    }

    if (!row.modelId?.trim()) {
      errors.push({
        row: rowNum,
        field: 'modelId',
        value: row.modelId,
        error: 'Model ID is required',
      });
    } else {
      const modelExists = models.find((m) => m.id === row.modelId);
      if (!modelExists) {
        errors.push({
          row: rowNum,
          field: 'modelId',
          value: row.modelId,
          error: 'Model ID does not exist',
        });
      } else {
        // Check if model belongs to the specified brand
        const model = models.find((m) => m.id === row.modelId);
        if (model && model.brandId !== row.brandId) {
          errors.push({
            row: rowNum,
            field: 'modelId',
            value: row.modelId,
            error: 'Model does not belong to the specified brand',
          });
        }
      }
    }

    // Price validation
    if (row.price !== undefined && row.price !== '') {
      const price = parseFloat(row.price);
      if (isNaN(price) || price < 0) {
        errors.push({
          row: rowNum,
          field: 'price',
          value: row.price,
          error: 'Price must be a valid positive number',
        });
      }
    }

    // Status validation
    if (row.status && !['active', 'inactive'].includes(row.status.toLowerCase())) {
      errors.push({
        row: rowNum,
        field: 'status',
        value: row.status,
        error: 'Status must be either "active" or "inactive"',
      });
    }

    // Boolean field validations
    const booleanFields = ['isValueForMoney'];
    booleanFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== '') {
        const value = row[field].toString().toLowerCase();
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value)) {
          errors.push({
            row: rowNum,
            field,
            value: row[field],
            error: 'Must be true/false, yes/no, or 1/0',
          });
        }
      }
    });
  });

  return errors;
};

export const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(
            new Error(`CSV parsing errors: ${results.errors.map((e) => e.message).join(', ')}`)
          );
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
