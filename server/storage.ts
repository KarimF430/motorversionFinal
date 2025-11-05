import type {
  Brand,
  InsertBrand,
  Model,
  InsertModel,
  Variant,
  InsertVariant,
  PopularComparison,
  InsertPopularComparison,
  AdminUser,
  InsertAdminUser,
} from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth';

export interface IStorage {
  // Brands
  getBrands(includeInactive?: boolean): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;
  getAvailableRankings(excludeBrandId?: string): Promise<number[]>;

  // Models
  getModels(brandId?: string): Promise<Model[]>;
  getModel(id: string): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: string, model: Partial<InsertModel>): Promise<Model | undefined>;
  deleteModel(id: string): Promise<boolean>;

  // Variants
  getVariants(modelId?: string, brandId?: string): Promise<Variant[]>;
  getVariant(id: string): Promise<Variant | undefined>;
  createVariant(variant: InsertVariant): Promise<Variant>;
  updateVariant(id: string, variant: Partial<InsertVariant>): Promise<Variant | undefined>;
  deleteVariant(id: string): Promise<boolean>;

  // Popular Comparisons
  getPopularComparisons(): Promise<PopularComparison[]>;
  savePopularComparisons(comparisons: InsertPopularComparison[]): Promise<PopularComparison[]>;

  // Admin Users
  getAdminUser(email: string): Promise<AdminUser | undefined>;
  getAdminUserById(id: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUserLogin(id: string): Promise<void>;

  // Session Management
  createSession(userId: string, token: string): Promise<void>;
  getActiveSession(userId: string): Promise<string | null>;
  invalidateSession(userId: string): Promise<void>;
  isSessionValid(userId: string, token: string): Promise<boolean>;

  // Stats
  getStats(): Promise<{
    totalBrands: number;
    totalModels: number;
    totalVariants: number;
  }>;
}

export class PersistentStorage implements IStorage {
  private brands: Brand[] = [];
  private models: Model[] = [];
  private variants: Variant[] = [];
  private popularComparisons: PopularComparison[] = [];
  private adminUsers: AdminUser[] = [];
  private activeSessions: Map<string, string> = new Map(); // userId -> token
  private dataDir: string;
  private brandsFile: string;
  private modelsFile: string;
  private variantsFile: string;
  private popularComparisonsFile: string;
  private adminUsersFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.brandsFile = path.join(this.dataDir, 'brands.json');
    this.modelsFile = path.join(this.dataDir, 'models.json');
    this.variantsFile = path.join(this.dataDir, 'variants.json');
    this.popularComparisonsFile = path.join(this.dataDir, 'popular-comparisons.json');
    this.adminUsersFile = path.join(this.dataDir, 'admin-users.json');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Load existing data
    this.loadData();
  }

  private loadData(): void {
    try {
      // Load brands
      if (fs.existsSync(this.brandsFile)) {
        const brandsData = fs.readFileSync(this.brandsFile, 'utf-8');
        this.brands = JSON.parse(brandsData);
        console.log(`Loaded ${this.brands.length} brands from storage`);
      }

      // Load models
      if (fs.existsSync(this.modelsFile)) {
        const modelsData = fs.readFileSync(this.modelsFile, 'utf-8');
        this.models = JSON.parse(modelsData);
        console.log(`Loaded ${this.models.length} models from storage`);
      }

      // Load variants
      if (fs.existsSync(this.variantsFile)) {
        const variantsData = fs.readFileSync(this.variantsFile, 'utf-8');
        this.variants = JSON.parse(variantsData);
        console.log(`Loaded ${this.variants.length} variants from storage`);
      }

      // Load popular comparisons
      if (fs.existsSync(this.popularComparisonsFile)) {
        const comparisonsData = fs.readFileSync(this.popularComparisonsFile, 'utf-8');
        this.popularComparisons = JSON.parse(comparisonsData);
        console.log(`Loaded ${this.popularComparisons.length} popular comparisons from storage`);
      }

      // Load admin users
      if (fs.existsSync(this.adminUsersFile)) {
        const usersData = fs.readFileSync(this.adminUsersFile, 'utf-8');
        this.adminUsers = JSON.parse(usersData);
        console.log(`Loaded ${this.adminUsers.length} admin users from storage`);
      } else {
        // Create default admin user if none exists
        this.createDefaultAdmin();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Initialize with empty arrays if loading fails
      this.brands = [];
      this.models = [];
      this.variants = [];
      this.popularComparisons = [];
      this.adminUsers = [];
    }
  }

  private async createDefaultAdmin(): Promise<void> {
    try {
      const defaultAdmin: InsertAdminUser = {
        email: 'admin@motoroctane.com',
        password: await hashPassword('Admin@123'),
        name: 'Admin',
        role: 'super_admin',
        isActive: true,
      };

      await this.createAdminUser(defaultAdmin);
      console.log('✅ Default admin user created: admin@motoroctane.com / Admin@123');
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  private saveData(): void {
    try {
      // Save brands
      fs.writeFileSync(this.brandsFile, JSON.stringify(this.brands, null, 2));

      // Save models
      fs.writeFileSync(this.modelsFile, JSON.stringify(this.models, null, 2));

      // Save variants
      fs.writeFileSync(this.variantsFile, JSON.stringify(this.variants, null, 2));

      // Save popular comparisons
      fs.writeFileSync(
        this.popularComparisonsFile,
        JSON.stringify(this.popularComparisons, null, 2)
      );

      // Save admin users
      fs.writeFileSync(this.adminUsersFile, JSON.stringify(this.adminUsers, null, 2));

      console.log('Data saved to persistent storage');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Helper to generate 10-digit brand ID
  private generateBrandId(): string {
    const id = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    // Check if ID exists, regenerate if it does
    if (this.brands.some((b) => b.id === id)) {
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
  async getBrands(includeInactive = false): Promise<Brand[]> {
    let brands = [...this.brands];
    if (!includeInactive) {
      brands = brands.filter((brand) => brand.status === 'active');
    }
    return brands.sort((a, b) => a.ranking - b.ranking);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    return this.brands.find((b) => b.id === id);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    // Check if brand name already exists
    const existingBrandWithName = this.brands.find(
      (b) => b.name.toLowerCase() === brand.name.toLowerCase()
    );
    if (existingBrandWithName) {
      throw new Error(`Brand "${brand.name}" already exists. Please use a different name.`);
    }

    // Auto-assign ranking based on creation order (next available position)
    const maxRanking = this.brands.length > 0 ? Math.max(...this.brands.map((b) => b.ranking)) : 0;
    const autoRanking = maxRanking + 1;

    const newBrand: Brand = {
      id: this.generateBrandId(),
      name: brand.name,
      logo: brand.logo || null,
      ranking: autoRanking, // Auto-assigned based on creation order
      status: brand.status || 'active',
      summary: brand.summary || null,
      faqs: (brand.faqs as { question: string; answer: string }[] | null) || null,
      createdAt: new Date(),
    };
    this.brands.push(newBrand);
    this.saveData(); // Save to persistent storage
    return newBrand;
  }

  async updateBrand(id: string, brand: Partial<InsertBrand>): Promise<Brand | undefined> {
    const index = this.brands.findIndex((b) => b.id === id);
    if (index === -1) return undefined;

    // Don't allow manual ranking changes - ranking is auto-managed by creation order
    const updateData = { ...brand };
    delete updateData.ranking; // Remove ranking from update data

    this.brands[index] = { ...this.brands[index], ...updateData };
    this.saveData(); // Save to persistent storage
    return this.brands[index];
  }

  async deleteBrand(id: string): Promise<boolean> {
    const index = this.brands.findIndex((b) => b.id === id);
    if (index === -1) return false;

    this.brands.splice(index, 1);
    // Also delete related models
    this.models = this.models.filter((m) => m.brandId !== id);
    this.saveData(); // Save to persistent storage
    return true;
  }

  // Models
  async getModels(brandId?: string): Promise<Model[]> {
    if (brandId) {
      return this.models.filter((m) => m.brandId === brandId);
    }
    return [...this.models];
  }

  async getModel(id: string): Promise<Model | undefined> {
    return this.models.find((m) => m.id === id);
  }

  async createModel(model: InsertModel): Promise<Model> {
    const brand = await this.getBrand(model.brandId);
    const newModel: Model = {
      id: this.generateModelId(brand?.name || 'BR', model.name),
      brandId: model.brandId,
      name: model.name,
      isPopular: model.isPopular || null,
      isNew: model.isNew || null,
      popularRank: model.popularRank || null,
      newRank: model.newRank || null,
      bodyType: model.bodyType || null,
      subBodyType: model.subBodyType || null,
      launchDate: model.launchDate || null,
      fuelTypes: model.fuelTypes || null,
      transmissions: model.transmissions || null,
      brochureUrl: model.brochureUrl || null,
      status: model.status || 'active',
      headerSeo: model.headerSeo || null,
      pros: model.pros || null,
      cons: model.cons || null,
      description: model.description || null,
      exteriorDesign: model.exteriorDesign || null,
      comfortConvenience: model.comfortConvenience || null,
      engineSummaries: (model.engineSummaries as any) || null,
      mileageData: (model.mileageData as any) || null,
      faqs: (model.faqs as any) || null,
      heroImage: model.heroImage || null,
      galleryImages: (model.galleryImages as any) || null,
      keyFeatureImages: (model.keyFeatureImages as any) || null,
      spaceComfortImages: (model.spaceComfortImages as any) || null,
      storageConvenienceImages: (model.storageConvenienceImages as any) || null,
      colorImages: (model.colorImages as any) || null,
      createdAt: new Date(),
    };
    this.models.push(newModel);
    this.saveData(); // Save to persistent storage
    return newModel;
  }

  async updateModel(id: string, model: Partial<InsertModel>): Promise<Model | undefined> {
    const index = this.models.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    this.models[index] = { ...this.models[index], ...model };
    this.saveData(); // Save to persistent storage
    return this.models[index];
  }

  async deleteModel(id: string): Promise<boolean> {
    const index = this.models.findIndex((m) => m.id === id);
    if (index === -1) return false;

    this.models.splice(index, 1);
    this.saveData(); // Save to persistent storage
    return true;
  }

  // Variant methods
  async getVariants(modelId?: string, brandId?: string): Promise<Variant[]> {
    let filtered = this.variants;

    if (modelId) {
      filtered = filtered.filter((v) => v.modelId === modelId);
    }

    if (brandId) {
      filtered = filtered.filter((v) => v.brandId === brandId);
    }

    return filtered;
  }

  async getVariant(id: string): Promise<Variant | undefined> {
    return this.variants.find((v) => v.id === id);
  }

  // Helper to generate variant ID: HOCIVX00001 (Brand+Model+Variant+Counter)
  private generateVariantId(brandId: string, modelId: string, variantName: string): string {
    // Get brand and model
    const brand = this.brands.find((b) => b.id === brandId);
    const model = this.models.find((m) => m.id === modelId);

    if (!brand || !model) {
      throw new Error('Brand or Model not found');
    }

    // Extract first 2 letters of brand name (e.g., "Honda" -> "HO")
    const brandPrefix = brand.name.substring(0, 2).toUpperCase();

    // Extract first 2 letters of model name (e.g., "City" -> "CI")
    const modelPrefix = model.name.substring(0, 2).toUpperCase();

    // Extract first 2 letters of variant name (e.g., "VXI" -> "VX")
    const variantPrefix = variantName.substring(0, 2).toUpperCase();

    // Count existing variants for this model to generate counter
    const existingVariants = this.variants.filter(
      (v) => v.brandId === brandId && v.modelId === modelId
    );
    const counter = (existingVariants.length + 1).toString().padStart(5, '0');

    return `${brandPrefix}${modelPrefix}${variantPrefix}${counter}`;
  }

  async createVariant(variant: InsertVariant): Promise<Variant> {
    const id = this.generateVariantId(variant.brandId, variant.modelId, variant.name);

    const newVariant: Variant = {
      ...variant,
      id,
      status: variant.status || 'active',
      highlightImages: (variant.highlightImages as any) || null,
      createdAt: new Date(),
    };
    this.variants.push(newVariant);
    this.saveData(); // Save to persistent storage
    return newVariant;
  }

  async updateVariant(id: string, variant: Partial<InsertVariant>): Promise<Variant | undefined> {
    const index = this.variants.findIndex((v) => v.id === id);
    if (index === -1) return undefined;

    this.variants[index] = { ...this.variants[index], ...variant };
    this.saveData(); // Save to persistent storage
    return this.variants[index];
  }

  async deleteVariant(id: string): Promise<boolean> {
    const index = this.variants.findIndex((v) => v.id === id);
    if (index === -1) return false;

    this.variants.splice(index, 1);
    this.saveData(); // Save to persistent storage
    return true;
  }

  // Get available rankings (1-50 minus already taken ones)
  async getAvailableRankings(excludeBrandId?: string): Promise<number[]> {
    const takenRankings = this.brands
      .filter((b) => (excludeBrandId ? b.id !== excludeBrandId : true))
      .map((b) => b.ranking);

    const allRankings = Array.from({ length: 50 }, (_, i) => i + 1);
    return allRankings.filter((ranking) => !takenRankings.includes(ranking));
  }

  // Popular Comparisons
  async getPopularComparisons(): Promise<PopularComparison[]> {
    return this.popularComparisons.filter((c) => c.isActive).sort((a, b) => a.order - b.order);
  }

  async savePopularComparisons(
    comparisons: InsertPopularComparison[]
  ): Promise<PopularComparison[]> {
    // Clear existing comparisons
    this.popularComparisons = [];

    // Create new comparisons with IDs
    const newComparisons: PopularComparison[] = comparisons.map((comp, index) => ({
      id: `comparison-${Date.now()}-${index}`,
      model1Id: comp.model1Id,
      model2Id: comp.model2Id,
      order: comp.order || index + 1,
      isActive: comp.isActive ?? true,
      createdAt: new Date(),
    }));

    this.popularComparisons = newComparisons;
    this.saveData();
    return this.popularComparisons;
  }

  // Admin Users
  async getAdminUser(email: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find((u) => u.email === email && u.isActive);
  }

  async getAdminUserById(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find((u) => u.id === id && u.isActive);
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const newUser: AdminUser = {
      id: `admin-${Date.now()}`,
      email: user.email,
      password: user.password, // Should already be hashed
      name: user.name,
      role: user.role || 'admin',
      isActive: user.isActive ?? true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.adminUsers.push(newUser);
    this.saveData();
    return newUser;
  }

  async updateAdminUserLogin(id: string): Promise<void> {
    const user = this.adminUsers.find((u) => u.id === id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      this.saveData();
    }
  }

  // Session Management
  async createSession(userId: string, token: string): Promise<void> {
    this.activeSessions.set(userId, token);
  }

  async getActiveSession(userId: string): Promise<string | null> {
    return this.activeSessions.get(userId) || null;
  }

  async invalidateSession(userId: string): Promise<void> {
    this.activeSessions.delete(userId);
  }

  async isSessionValid(userId: string, token: string): Promise<boolean> {
    const activeToken = this.activeSessions.get(userId);
    return activeToken === token;
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

export const storage = new PersistentStorage();
