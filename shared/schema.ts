import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  ranking: integer("ranking").notNull(),
  status: text("status").notNull().default("active"),
  summary: text("summary"),
  faqs: jsonb("faqs").$type<{ question: string; answer: string }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const models = pgTable("models", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isPopular: boolean("is_popular").default(false),
  isNew: boolean("is_new").default(false),
  popularRank: integer("popular_rank"),
  newRank: integer("new_rank"),
  bodyType: text("body_type"),
  subBodyType: text("sub_body_type"),
  launchDate: text("launch_date"),
  fuelTypes: text("fuel_types").array(),
  transmissions: text("transmissions").array(),
  brochureUrl: text("brochure_url"),
  status: text("status").notNull().default("active"),
  
  // Page 1 - Text content
  headerSeo: text("header_seo"),
  pros: text("pros"),
  cons: text("cons"),
  description: text("description"),
  exteriorDesign: text("exterior_design"),
  comfortConvenience: text("comfort_convenience"),
  
  // Page 2 - Engine summaries and mileage
  engineSummaries: jsonb("engine_summaries").$type<{
    title: string;
    summary: string;
    transmission: string;
    power: string;
    torque: string;
    speed: string;
  }[]>().default([]),
  mileageData: jsonb("mileage_data").$type<{
    engineName: string;
    companyClaimed: string;
    cityRealWorld: string;
    highwayRealWorld: string;
  }[]>().default([]),
  faqs: jsonb("faqs").$type<{ question: string; answer: string }[]>().default([]),
  
  // Page 3 - Images
  heroImage: text("hero_image"),
  galleryImages: jsonb("gallery_images").$type<{ url: string; caption: string }[]>().default([]),
  keyFeatureImages: jsonb("key_feature_images").$type<{ url: string; caption: string }[]>().default([]),
  spaceComfortImages: jsonb("space_comfort_images").$type<{ url: string; caption: string }[]>().default([]),
  storageConvenienceImages: jsonb("storage_convenience_images").$type<{ url: string; caption: string }[]>().default([]),
  
  // Page 4 - Color images
  colorImages: jsonb("color_images").$type<{ url: string; caption: string }[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const variants = pgTable("variants", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  modelId: text("model_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  isValueForMoney: boolean("is_value_for_money").default(false),
  
  // Basic Info
  price: integer("price").notNull(), // Strictly digit field
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  
  // Page 1 - Content
  keyFeatures: text("key_features"), // Long text box
  headerSummary: text("header_summary"), // Long text with bullet points
  highlightImages: jsonb("highlight_images").$type<{ url: string; caption: string }[]>().default([]),
  
  // SEO Summary sections
  description: text("description"),
  exteriorDesign: text("exterior_design"),
  comfortConvenience: text("comfort_convenience"),
  
  // Page 2 - Engine Data
  engineName: text("engine_name"),
  engineSummary: text("engine_summary"),
  engineTransmission: text("engine_transmission"),
  enginePower: text("engine_power"),
  engineTorque: text("engine_torque"),
  engineSpeed: text("engine_speed"),
  
  // Page 2 - Mileage
  mileageEngineName: text("mileage_engine_name"),
  mileageCompanyClaimed: text("mileage_company_claimed"),
  mileageCityRealWorld: text("mileage_city_real_world"),
  mileageHighwayRealWorld: text("mileage_highway_real_world"),
  
  // Page 2 - Comfort & Convenience Features
  ventilatedSeats: text("ventilated_seats"),
  sunroof: text("sunroof"),
  airPurifier: text("air_purifier"),
  headsUpDisplay: text("heads_up_display"),
  cruiseControl: text("cruise_control"),
  rainSensingWipers: text("rain_sensing_wipers"),
  automaticHeadlamp: text("automatic_headlamp"),
  followMeHomeHeadlights: text("follow_me_home_headlights"),
  keylessEntry: text("keyless_entry"),
  ignition: text("ignition"),
  ambientLighting: text("ambient_lighting"),
  steeringAdjustment: text("steering_adjustment"),
  airConditioning: text("air_conditioning"),
  climateZones: text("climate_zones"),
  rearACVents: text("rear_ac_vents"),
  frontArmrest: text("front_armrest"),
  rearArmrest: text("rear_armrest"),
  insideRearViewMirror: text("inside_rear_view_mirror"),
  outsideRearViewMirrors: text("outside_rear_view_mirrors"),
  steeringMountedControls: text("steering_mounted_controls"),
  rearWindshieldDefogger: text("rear_windshield_defogger"),
  frontWindshieldDefogger: text("front_windshield_defogger"),
  cooledGlovebox: text("cooled_glovebox"),
  
  // Page 3 - Safety Features
  globalNCAPRating: text("global_ncap_rating"),
  airbags: text("airbags"),
  airbagsLocation: text("airbags_location"),
  adasLevel: text("adas_level"),
  adasFeatures: text("adas_features"),
  reverseCamera: text("reverse_camera"),
  reverseCameraGuidelines: text("reverse_camera_guidelines"),
  tyrePressureMonitor: text("tyre_pressure_monitor"),
  hillHoldAssist: text("hill_hold_assist"),
  hillDescentControl: text("hill_descent_control"),
  rollOverMitigation: text("roll_over_mitigation"),
  parkingSensor: text("parking_sensor"),
  discBrakes: text("disc_brakes"),
  electronicStabilityProgram: text("electronic_stability_program"),
  abs: text("abs"),
  ebd: text("ebd"),
  brakeAssist: text("brake_assist"),
  isofixMounts: text("isofix_mounts"),
  seatbeltWarning: text("seatbelt_warning"),
  speedAlertSystem: text("speed_alert_system"),
  speedSensingDoorLocks: text("speed_sensing_door_locks"),
  immobiliser: text("immobiliser"),
  
  // Page 3 - Entertainment & Connectivity
  touchScreenInfotainment: text("touch_screen_infotainment"),
  androidAppleCarplay: text("android_apple_carplay"),
  speakers: text("speakers"),
  tweeters: text("tweeters"),
  subwoofers: text("subwoofers"),
  usbCChargingPorts: text("usb_c_charging_ports"),
  usbAChargingPorts: text("usb_a_charging_ports"),
  twelvevChargingPorts: text("12v_charging_ports"),
  wirelessCharging: text("wireless_charging"),
  connectedCarTech: text("connected_car_tech"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertBrandSchema = createInsertSchema(brands).omit({ 
  id: true,
  createdAt: true
  // ranking is required - not auto-assigned
});
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

export const insertModelSchema = createInsertSchema(models).omit({ 
  id: true,
  createdAt: true 
});
export type InsertModel = z.infer<typeof insertModelSchema>;
export type Model = typeof models.$inferSelect;

export const insertVariantSchema = createInsertSchema(variants).omit({ 
  id: true,
  createdAt: true 
});
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type Variant = typeof variants.$inferSelect;

// Popular Comparisons
export const popularComparisons = pgTable("popular_comparisons", {
  id: text("id").primaryKey(),
  model1Id: text("model1_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  model2Id: text("model2_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPopularComparisonSchema = createInsertSchema(popularComparisons).omit({ 
  id: true,
  createdAt: true 
});
export type InsertPopularComparison = z.infer<typeof insertPopularComparisonSchema>;
export type PopularComparison = typeof popularComparisons.$inferSelect;

// Admin Users for Authentication
export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
