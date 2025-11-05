import mongoose from 'mongoose';

// Brand Schema
const brandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  logo: { type: String, default: null },
  ranking: { type: Number, default: 999 }, // Auto-assign high ranking if not provided
  status: { type: String, default: 'active' },
  summary: { type: String, default: null },
  faqs: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Create indexes for better performance
brandSchema.index({ id: 1 }, { unique: true });
brandSchema.index({ status: 1, ranking: 1 });
brandSchema.index({ name: 1 });

// Model Schema
const modelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brandId: { type: String, required: true },
  status: { type: String, default: 'active' },

  // Popularity & Rankings
  isPopular: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  popularRank: { type: Number, default: null },
  newRank: { type: Number, default: null },

  // Basic Info
  bodyType: { type: String, default: null },
  subBodyType: { type: String, default: null },
  launchDate: { type: String, default: null },
  seating: { type: Number, default: 5 },
  fuelTypes: { type: [String], default: [] },
  transmissions: { type: [String], default: [] },
  brochureUrl: { type: String, default: null },

  // SEO & Content
  headerSeo: { type: String, default: null },
  pros: { type: String, default: null },
  cons: { type: String, default: null },
  description: { type: String, default: null },
  exteriorDesign: { type: String, default: null },
  comfortConvenience: { type: String, default: null },
  summary: { type: String, default: null },

  // Engine Summaries
  engineSummaries: [
    {
      title: { type: String },
      summary: { type: String },
      transmission: { type: String },
      power: { type: String },
      torque: { type: String },
      speed: { type: String },
    },
  ],

  // Mileage Data
  mileageData: [
    {
      engineName: { type: String },
      companyClaimed: { type: String },
      cityRealWorld: { type: String },
      highwayRealWorld: { type: String },
    },
  ],

  // FAQs
  faqs: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],

  // Images
  heroImage: { type: String, default: null },
  galleryImages: [
    {
      url: { type: String },
      caption: { type: String },
    },
  ],
  keyFeatureImages: [
    {
      url: { type: String },
      caption: { type: String },
    },
  ],
  spaceComfortImages: [
    {
      url: { type: String },
      caption: { type: String },
    },
  ],
  storageConvenienceImages: [
    {
      url: { type: String },
      caption: { type: String },
    },
  ],
  colorImages: [
    {
      url: { type: String },
      caption: { type: String },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

modelSchema.index({ id: 1 }, { unique: true });
modelSchema.index({ brandId: 1, status: 1 });
modelSchema.index({ name: 1 });

// Variant Schema
const variantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brandId: { type: String, required: true },
  modelId: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'active' },
  description: { type: String, default: null },

  // Key Features
  isValueForMoney: { type: Boolean, default: false },
  keyFeatures: { type: String, default: null },
  headerSummary: { type: String, default: null },

  // Design & Styling
  exteriorDesign: { type: String, default: null },
  comfortConvenience: { type: String, default: null },

  // Engine Specifications
  engineName: { type: String, default: null },
  engineSummary: { type: String, default: null },
  engineTransmission: { type: String, default: null },
  enginePower: { type: String, default: null },
  engineTorque: { type: String, default: null },
  engineSpeed: { type: String, default: null },
  engineType: { type: String, default: null },
  displacement: { type: String, default: null },
  power: { type: String, default: null },
  torque: { type: String, default: null },
  transmission: { type: String, default: null },
  driveType: { type: String, default: null },
  fuelType: { type: String, default: null },
  fuel: { type: String, default: null },

  // Mileage
  mileageEngineName: { type: String, default: null },
  mileageCompanyClaimed: { type: String, default: null },
  mileageCityRealWorld: { type: String, default: null },
  mileageHighwayRealWorld: { type: String, default: null },
  mileageCity: { type: String, default: null },
  mileageHighway: { type: String, default: null },
  fuelTankCapacity: { type: String, default: null },
  emissionStandard: { type: String, default: null },

  // Dimensions
  groundClearance: { type: String, default: null },
  length: { type: String, default: null },
  width: { type: String, default: null },
  height: { type: String, default: null },
  wheelbase: { type: String, default: null },
  turningRadius: { type: String, default: null },
  kerbWeight: { type: String, default: null },
  frontTyreProfile: { type: String, default: null },
  rearTyreProfile: { type: String, default: null },
  spareTyreProfile: { type: String, default: null },
  spareWheelType: { type: String, default: null },
  cupholders: { type: String, default: null },
  bootSpace: { type: String, default: null },
  bootSpaceAfterFoldingRearRowSeats: { type: String, default: null },
  seatingCapacity: { type: String, default: null },
  doors: { type: String, default: null },

  // Performance
  engineNamePage4: { type: String, default: null },
  engineCapacity: { type: String, default: null },
  noOfGears: { type: String, default: null },
  paddleShifter: { type: String, default: null },
  maxPower: { type: String, default: null },
  zeroTo100KmphTime: { type: String, default: null },
  topSpeed: { type: String, default: null },
  evBatteryCapacity: { type: String, default: null },
  hybridBatteryCapacity: { type: String, default: null },
  batteryType: { type: String, default: null },
  electricMotorPlacement: { type: String, default: null },
  evRange: { type: String, default: null },
  evChargingTime: { type: String, default: null },
  maxElectricMotorPower: { type: String, default: null },
  turboCharged: { type: String, default: null },
  hybridType: { type: String, default: null },
  driveTrain: { type: String, default: null },
  drivingModes: { type: String, default: null },
  offRoadModes: { type: String, default: null },
  differentialLock: { type: String, default: null },
  limitedSlipDifferential: { type: String, default: null },
  acceleration: { type: String, default: null },

  // Suspension & Brakes
  frontSuspension: { type: String, default: null },
  rearSuspension: { type: String, default: null },
  frontBrake: { type: String, default: null },
  rearBrake: { type: String, default: null },

  // Wheels & Tyres
  wheelSize: { type: String, default: null },
  tyreSize: { type: String, default: null },
  spareTyre: { type: String, default: null },

  // Safety Features
  globalNCAPRating: { type: String, default: null },
  airbags: { type: String, default: null },
  airbagsLocation: { type: String, default: null },
  adasLevel: { type: String, default: null },
  adasFeatures: { type: String, default: null },
  reverseCamera: { type: String, default: null },
  reverseCameraGuidelines: { type: String, default: null },
  tyrePressureMonitor: { type: String, default: null },
  hillHoldAssist: { type: String, default: null },
  hillDescentControl: { type: String, default: null },
  rollOverMitigation: { type: String, default: null },
  parkingSensor: { type: String, default: null },
  discBrakes: { type: String, default: null },
  electronicStabilityProgram: { type: String, default: null },
  abs: { type: String, default: null },
  ebd: { type: String, default: null },
  brakeAssist: { type: String, default: null },
  isofixMounts: { type: String, default: null },
  seatbeltWarning: { type: String, default: null },
  speedAlertSystem: { type: String, default: null },
  speedSensingDoorLocks: { type: String, default: null },
  immobiliser: { type: String, default: null },
  esc: { type: String, default: null },
  tractionControl: { type: String, default: null },
  hillAssist: { type: String, default: null },
  isofix: { type: String, default: null },
  parkingSensors: { type: String, default: null },
  parkingCamera: { type: String, default: null },
  blindSpotMonitor: { type: String, default: null },

  // Comfort & Convenience
  ventilatedSeats: { type: String, default: null },
  sunroof: { type: String, default: null },
  airPurifier: { type: String, default: null },
  headsUpDisplay: { type: String, default: null },
  cruiseControl: { type: String, default: null },
  rainSensingWipers: { type: String, default: null },
  automaticHeadlamp: { type: String, default: null },
  followMeHomeHeadlights: { type: String, default: null },
  keylessEntry: { type: String, default: null },
  ignition: { type: String, default: null },
  ambientLighting: { type: String, default: null },
  steeringAdjustment: { type: String, default: null },
  airConditioning: { type: String, default: null },
  climateZones: { type: String, default: null },
  climateControl: { type: String, default: null },
  rearACVents: { type: String, default: null },
  frontArmrest: { type: String, default: null },
  rearArmrest: { type: String, default: null },
  insideRearViewMirror: { type: String, default: null },
  outsideRearViewMirrors: { type: String, default: null },
  steeringMountedControls: { type: String, default: null },
  rearWindshieldDefogger: { type: String, default: null },
  frontWindshieldDefogger: { type: String, default: null },
  cooledGlovebox: { type: String, default: null },
  pushButtonStart: { type: String, default: null },
  powerWindows: { type: String, default: null },
  powerSteering: { type: String, default: null },

  // Infotainment
  touchScreenInfotainment: { type: String, default: null },
  androidAppleCarplay: { type: String, default: null },
  speakers: { type: String, default: null },
  tweeters: { type: String, default: null },
  subwoofers: { type: String, default: null },
  usbCChargingPorts: { type: String, default: null },
  usbAChargingPorts: { type: String, default: null },
  twelvevChargingPorts: { type: String, default: null },
  wirelessCharging: { type: String, default: null },
  infotainmentScreen: { type: String, default: null },
  bluetooth: { type: String, default: null },
  usb: { type: String, default: null },
  aux: { type: String, default: null },
  androidAuto: { type: String, default: null },
  appleCarPlay: { type: String, default: null },

  // Lighting
  headLights: { type: String, default: null },
  tailLight: { type: String, default: null },
  frontFogLights: { type: String, default: null },
  daytimeRunningLights: { type: String, default: null },
  headlights: { type: String, default: null },
  drl: { type: String, default: null },
  fogLights: { type: String, default: null },
  tailLights: { type: String, default: null },

  // Exterior
  roofRails: { type: String, default: null },
  radioAntenna: { type: String, default: null },
  outsideRearViewMirror: { type: String, default: null },
  sideIndicator: { type: String, default: null },
  rearWindshieldWiper: { type: String, default: null },
  orvm: { type: String, default: null },
  alloyWheels: { type: String, default: null },

  // Seating
  seatUpholstery: { type: String, default: null },
  seatsAdjustment: { type: String, default: null },
  driverSeatAdjustment: { type: String, default: null },
  passengerSeatAdjustment: { type: String, default: null },
  rearSeatAdjustment: { type: String, default: null },
  welcomeSeats: { type: String, default: null },
  memorySeats: { type: String, default: null },

  // Warranty
  warranty: { type: String, default: null },

  // Images
  highlightImages: [
    {
      url: { type: String },
      caption: { type: String },
    },
  ],

  // Connected Car Tech
  connectedCarTech: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

variantSchema.index({ id: 1 }, { unique: true });
variantSchema.index({ modelId: 1, brandId: 1, status: 1 });
variantSchema.index({ price: 1 });

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

adminUserSchema.index({ email: 1 }, { unique: true });
adminUserSchema.index({ id: 1 }, { unique: true });

// Popular Comparison Schema
const popularComparisonSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  model1Id: { type: String, required: true },
  model2Id: { type: String, required: true },
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

popularComparisonSchema.index({ id: 1 }, { unique: true });
popularComparisonSchema.index({ isActive: 1, order: 1 });

// Export models
export const Brand = mongoose.model('Brand', brandSchema);
export const Model = mongoose.model('Model', modelSchema);
export const Variant = mongoose.model('Variant', variantSchema);
export const AdminUser = mongoose.model('AdminUser', adminUserSchema);
export const PopularComparison = mongoose.model('PopularComparison', popularComparisonSchema);
