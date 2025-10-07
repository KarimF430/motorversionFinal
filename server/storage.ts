import type { Brand, InsertBrand, Model, InsertModel, Variant, InsertVariant } from "@shared/schema";

export interface IStorage {
  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;

  // Models
  getModels(brandId?: string): Promise<Model[]>;
  getModel(id: string): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: string, model: Partial<InsertModel>): Promise<Model | undefined>;
  deleteModel(id: string): Promise<boolean>;

  // Variants
  getVariants(modelId?: string): Promise<Variant[]>;
  getVariant(id: string): Promise<Variant | undefined>;
  createVariant(variant: InsertVariant): Promise<Variant>;
  updateVariant(id: string, variant: Partial<InsertVariant>): Promise<Variant | undefined>;
  deleteVariant(id: string): Promise<boolean>;

  // Stats
  getStats(): Promise<{
    totalBrands: number;
    totalModels: number;
    totalVariants: number;
  }>;
}

export class MemStorage implements IStorage {
  private brands: Brand[] = [];
  private models: Model[] = [];
  private variants: Variant[] = [];

  // Helper to generate 8-digit brand ID
  private generateBrandId(): string {
    const id = Math.floor(10000000 + Math.random() * 90000000).toString();
    // Check if ID exists, regenerate if it does
    if (this.brands.some(b => b.id === id)) {
      return this.generateBrandId();
    }
    return id;
  }

  // Helper to generate model ID in format: BRANDCODE+MODELCODE+4digits
  private generateModelId(brandName: string, modelName: string): string {
    const brandCode = brandName.substring(0, 2).toUpperCase();
    const modelCode = modelName.substring(0, 2).toUpperCase();
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    return `${brandCode}${modelCode}${digits}`;
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return [...this.brands].sort((a, b) => a.ranking - b.ranking);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    return this.brands.find(b => b.id === id);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const newBrand: Brand = {
      ...brand,
      id: this.generateBrandId(),
      createdAt: new Date(),
    };
    this.brands.push(newBrand);
    return newBrand;
  }

  async updateBrand(id: string, brand: Partial<InsertBrand>): Promise<Brand | undefined> {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    
    this.brands[index] = { ...this.brands[index], ...brand };
    return this.brands[index];
  }

  async deleteBrand(id: string): Promise<boolean> {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) return false;
    
    this.brands.splice(index, 1);
    // Also delete related models
    this.models = this.models.filter(m => m.brandId !== id);
    return true;
  }

  // Models
  async getModels(brandId?: string): Promise<Model[]> {
    if (brandId) {
      return this.models.filter(m => m.brandId === brandId);
    }
    return [...this.models];
  }

  async getModel(id: string): Promise<Model | undefined> {
    return this.models.find(m => m.id === id);
  }

  async createModel(model: InsertModel): Promise<Model> {
    const brand = await this.getBrand(model.brandId);
    const newModel: Model = {
      ...model,
      id: this.generateModelId(brand?.name || 'BR', model.name),
      createdAt: new Date(),
    };
    this.models.push(newModel);
    return newModel;
  }

  async updateModel(id: string, model: Partial<InsertModel>): Promise<Model | undefined> {
    const index = this.models.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    
    this.models[index] = { ...this.models[index], ...model };
    return this.models[index];
  }

  async deleteModel(id: string): Promise<boolean> {
    const index = this.models.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.models.splice(index, 1);
    // Also delete related variants
    this.variants = this.variants.filter(v => v.modelId !== id);
    return true;
  }

  // Variants
  async getVariants(modelId?: string): Promise<Variant[]> {
    if (modelId) {
      return this.variants.filter(v => v.modelId === modelId);
    }
    return [...this.variants];
  }

  async getVariant(id: string): Promise<Variant | undefined> {
    return this.variants.find(v => v.id === id);
  }

  async createVariant(variant: InsertVariant): Promise<Variant> {
    const newVariant: Variant = {
      ...variant,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.variants.push(newVariant);
    return newVariant;
  }

  async updateVariant(id: string, variant: Partial<InsertVariant>): Promise<Variant | undefined> {
    const index = this.variants.findIndex(v => v.id === id);
    if (index === -1) return undefined;
    
    this.variants[index] = { ...this.variants[index], ...variant };
    return this.variants[index];
  }

  async deleteVariant(id: string): Promise<boolean> {
    const index = this.variants.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    this.variants.splice(index, 1);
    return true;
  }

  // Stats
  async getStats(): Promise<{ totalBrands: number; totalModels: number; totalVariants: number }> {
    return {
      totalBrands: this.brands.length,
      totalModels: this.models.length,
      totalVariants: this.variants.length,
    };
  }
}

export const storage = new MemStorage();
