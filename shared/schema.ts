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
  modelId: text("model_id").notNull().references(() => models.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertBrandSchema = createInsertSchema(brands).omit({ 
  id: true,
  createdAt: true 
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
