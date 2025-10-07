import type { Express } from "express";
import { storage } from "./storage";
import { insertBrandSchema, insertModelSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Stats
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Brands
  app.get("/api/brands", async (req, res) => {
    const brands = await storage.getBrands();
    res.json(brands);
  });

  app.get("/api/brands/:id", async (req, res) => {
    const brand = await storage.getBrand(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(brand);
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const validatedData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(validatedData);
      res.status(201).json(brand);
    } catch (error) {
      res.status(400).json({ error: "Invalid brand data" });
    }
  });

  app.patch("/api/brands/:id", async (req, res) => {
    const brand = await storage.updateBrand(req.params.id, req.body);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(brand);
  });

  app.delete("/api/brands/:id", async (req, res) => {
    const success = await storage.deleteBrand(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.status(204).send();
  });

  // Models
  app.get("/api/models", async (req, res) => {
    const brandId = req.query.brandId as string | undefined;
    const models = await storage.getModels(brandId);
    res.json(models);
  });

  app.get("/api/models/:id", async (req, res) => {
    const model = await storage.getModel(req.params.id);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    res.json(model);
  });

  app.post("/api/models", async (req, res) => {
    try {
      const validatedData = insertModelSchema.parse(req.body);
      const model = await storage.createModel(validatedData);
      res.status(201).json(model);
    } catch (error) {
      res.status(400).json({ error: "Invalid model data" });
    }
  });

  app.patch("/api/models/:id", async (req, res) => {
    const model = await storage.updateModel(req.params.id, req.body);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    res.json(model);
  });

  app.delete("/api/models/:id", async (req, res) => {
    const success = await storage.deleteModel(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Model not found" });
    }
    res.status(204).send();
  });

  // Variants
  app.get("/api/variants", async (req, res) => {
    const modelId = req.query.modelId as string | undefined;
    const variants = await storage.getVariants(modelId);
    res.json(variants);
  });

  app.get("/api/variants/:id", async (req, res) => {
    const variant = await storage.getVariant(req.params.id);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    res.json(variant);
  });

  app.post("/api/variants", async (req, res) => {
    const variant = await storage.createVariant(req.body);
    res.status(201).json(variant);
  });

  app.patch("/api/variants/:id", async (req, res) => {
    const variant = await storage.updateVariant(req.params.id, req.body);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    res.json(variant);
  });

  app.delete("/api/variants/:id", async (req, res) => {
    const success = await storage.deleteVariant(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Variant not found" });
    }
    res.status(204).send();
  });
}
