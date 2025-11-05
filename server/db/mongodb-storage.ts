import mongoose from 'mongoose';
import { IStorage } from '../storage';
import { Brand, Model, Variant, AdminUser, PopularComparison } from './schemas';
import type { 
  Brand as BrandType, 
  InsertBrand,
  Model as ModelType,
  InsertModel,
  Variant as VariantType,
  InsertVariant,
  PopularComparison as PopularComparisonType,
  InsertPopularComparison,
  AdminUser as AdminUserType,
  InsertAdminUser
} from '@shared/schema';

export class MongoDBStorage implements IStorage {
  private activeSessions: Map<string, string> = new Map();

  async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB');
      
      // Setup connection event handlers
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  // ============================================
  // BRANDS
  // ============================================

  async getBrands(includeInactive?: boolean): Promise<BrandType[]> {
    try {
      const filter = includeInactive ? {} : { status: 'active' };
      const brands = await Brand.find(filter).sort({ ranking: 1 }).lean();
      return brands as BrandType[];
    } catch (error) {
      console.error('getBrands error:', error);
      throw new Error('Failed to fetch brands');
    }
  }

  async getBrand(id: string): Promise<BrandType | undefined> {
    try {
      const brand = await Brand.findOne({ id }).lean();
      return brand ? (brand as BrandType) : undefined;
    } catch (error) {
      console.error('getBrand error:', error);
      throw new Error('Failed to fetch brand');
    }
  }

  async createBrand(brand: InsertBrand): Promise<BrandType> {
    try {
      // Auto-assign ranking if not provided
      let ranking = brand.ranking;
      if (!ranking) {
        // Find the highest ranking and add 1
        const highestRanked = await Brand.findOne().sort({ ranking: -1 }).lean();
        ranking = highestRanked ? (highestRanked.ranking || 0) + 1 : 1;
      }
      
      // Generate unique slug-based ID from brand name
      const slug = brand.name.toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '')     // Remove special characters
        .replace(/-+/g, '-')            // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
      
      // Check if slug already exists, append number if needed
      let uniqueId = slug;
      let counter = 1;
      while (await Brand.findOne({ id: uniqueId }).lean()) {
        uniqueId = `${slug}-${counter}`;
        counter++;
      }
      
      const newBrand = new Brand({
        id: uniqueId,
        ...brand,
        ranking,
        createdAt: new Date()
      });
      await newBrand.save();
      return newBrand.toObject() as BrandType;
    } catch (error) {
      console.error('createBrand error:', error);
      throw new Error('Failed to create brand');
    }
  }

  async updateBrand(id: string, brand: Partial<InsertBrand>): Promise<BrandType | undefined> {
    try {
      const updated = await Brand.findOneAndUpdate(
        { id },
        { $set: brand },
        { new: true }
      ).lean();
      return updated ? (updated as BrandType) : undefined;
    } catch (error) {
      console.error('updateBrand error:', error);
      throw new Error('Failed to update brand');
    }
  }

  async deleteBrand(id: string): Promise<boolean> {
    try {
      // First, get all models for this brand
      const models = await Model.find({ brandId: id }).lean();
      const modelIds = models.map(m => m.id);
      
      // Delete all variants for these models
      if (modelIds.length > 0) {
        await Variant.deleteMany({ modelId: { $in: modelIds } });
        console.log(`Deleted variants for ${modelIds.length} models`);
      }
      
      // Delete all models for this brand
      await Model.deleteMany({ brandId: id });
      console.log(`Deleted models for brand: ${id}`);
      
      // Finally, delete the brand itself
      const result = await Brand.deleteOne({ id });
      console.log(`Delete brand result:`, result);
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('deleteBrand error:', error);
      throw new Error('Failed to delete brand');
    }
  }

  async getAvailableRankings(excludeBrandId?: string): Promise<number[]> {
    try {
      const filter = excludeBrandId ? { id: { $ne: excludeBrandId } } : {};
      const brands = await Brand.find(filter).select('ranking').lean();
      const takenRankings = brands.map(b => b.ranking);
      
      const allRankings = Array.from({ length: 50 }, (_, i) => i + 1);
      return allRankings.filter(ranking => !takenRankings.includes(ranking));
    } catch (error) {
      console.error('getAvailableRankings error:', error);
      throw new Error('Failed to fetch available rankings');
    }
  }

  // ============================================
  // MODELS
  // ============================================

  async getModels(brandId?: string): Promise<ModelType[]> {
    try {
      const filter = brandId ? { brandId, status: 'active' } : { status: 'active' };
      const models = await Model.find(filter).lean();
      return models as ModelType[];
    } catch (error) {
      console.error('getModels error:', error);
      throw new Error('Failed to fetch models');
    }
  }

  async getModel(id: string): Promise<ModelType | undefined> {
    try {
      const model = await Model.findOne({ id }).lean();
      return model ? (model as ModelType) : undefined;
    } catch (error) {
      console.error('getModel error:', error);
      throw new Error('Failed to fetch model');
    }
  }

  async createModel(model: InsertModel): Promise<ModelType> {
    try {
      // Get brand name for slug generation
      const brand = await Brand.findOne({ id: model.brandId }).lean();
      const brandSlug = brand ? brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'unknown';
      
      // Generate unique slug-based ID: brandslug-modelname
      const modelSlug = model.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const baseId = `${brandSlug}-${modelSlug}`;
      
      // Check for collisions and append number if needed
      let uniqueId = baseId;
      let counter = 1;
      while (await Model.findOne({ id: uniqueId }).lean()) {
        uniqueId = `${baseId}-${counter}`;
        counter++;
      }
      
      const newModel = new Model({
        id: uniqueId,
        ...model,
        createdAt: new Date()
      });
      await newModel.save();
      return newModel.toObject() as ModelType;
    } catch (error) {
      console.error('createModel error:', error);
      throw new Error('Failed to create model');
    }
  }

  async updateModel(id: string, model: Partial<InsertModel>): Promise<ModelType | undefined> {
    try {
      const updated = await Model.findOneAndUpdate(
        { id },
        { $set: model },
        { new: true }
      ).lean();
      return updated ? (updated as ModelType) : undefined;
    } catch (error) {
      console.error('updateModel error:', error);
      throw new Error('Failed to update model');
    }
  }

  async deleteModel(id: string): Promise<boolean> {
    try {
      // First, delete all variants associated with this model
      await Variant.deleteMany({ modelId: id });
      console.log(`Deleted variants for model: ${id}`);
      
      // Then delete the model itself
      const result = await Model.deleteOne({ id });
      console.log(`Delete model result:`, result);
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('deleteModel error:', error);
      throw new Error('Failed to delete model');
    }
  }

  // ============================================
  // VARIANTS
  // ============================================

  async getVariants(modelId?: string, brandId?: string): Promise<VariantType[]> {
    try {
      const filter: any = { status: 'active' };
      if (modelId) filter.modelId = modelId;
      if (brandId) filter.brandId = brandId;
      const variants = await Variant.find(filter).lean();
      return variants as VariantType[];
    } catch (error) {
      console.error('getVariants error:', error);
      throw new Error('Failed to fetch variants');
    }
  }

  async getVariant(id: string): Promise<VariantType | undefined> {
    try {
      const variant = await Variant.findOne({ id }).lean();
      return variant ? (variant as VariantType) : undefined;
    } catch (error) {
      console.error('getVariant error:', error);
      throw new Error('Failed to fetch variant');
    }
  }

  async createVariant(variant: InsertVariant): Promise<VariantType> {
    try {
      // Get model and brand for slug generation
      const model = await Model.findOne({ id: variant.modelId }).lean();
      const modelSlug = model ? model.id : 'unknown'; // Model ID already has brand-model format
      
      // Generate unique slug-based ID: modelid-variantname
      const variantSlug = variant.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const baseId = `${modelSlug}-${variantSlug}`;
      
      // Check for collisions and append number if needed
      let uniqueId = baseId;
      let counter = 1;
      while (await Variant.findOne({ id: uniqueId }).lean()) {
        uniqueId = `${baseId}-${counter}`;
        counter++;
      }
      
      const newVariant = new Variant({
        id: uniqueId,
        ...variant,
        createdAt: new Date()
      });
      await newVariant.save();
      return newVariant.toObject() as VariantType;
    } catch (error) {
      console.error('createVariant error:', error);
      throw new Error('Failed to create variant');
    }
  }

  async updateVariant(id: string, variant: Partial<InsertVariant>): Promise<VariantType | undefined> {
    try {
      const updated = await Variant.findOneAndUpdate(
        { id },
        { $set: variant },
        { new: true }
      ).lean();
      return updated ? (updated as VariantType) : undefined;
    } catch (error) {
      console.error('updateVariant error:', error);
      throw new Error('Failed to update variant');
    }
  }

  async deleteVariant(id: string): Promise<boolean> {
    try {
      const result = await Variant.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('deleteVariant error:', error);
      throw new Error('Failed to delete variant');
    }
  }

  // ============================================
  // POPULAR COMPARISONS
  // ============================================

  async getPopularComparisons(): Promise<PopularComparisonType[]> {
    try {
      const comparisons = await PopularComparison.find({ isActive: true })
        .sort({ order: 1 })
        .lean();
      return comparisons as PopularComparisonType[];
    } catch (error) {
      console.error('getPopularComparisons error:', error);
      throw new Error('Failed to fetch popular comparisons');
    }
  }

  async savePopularComparisons(comparisons: InsertPopularComparison[]): Promise<PopularComparisonType[]> {
    try {
      // Clear existing
      await PopularComparison.deleteMany({});
      
      // Create new
      const newComparisons = comparisons.map((comp, index) => ({
        id: `comparison-${Date.now()}-${index}`,
        ...comp,
        order: comp.order || index + 1,
        isActive: comp.isActive ?? true,
        createdAt: new Date()
      }));
      
      await PopularComparison.insertMany(newComparisons);
      return await this.getPopularComparisons();
    } catch (error) {
      console.error('savePopularComparisons error:', error);
      throw new Error('Failed to save popular comparisons');
    }
  }

  // ============================================
  // ADMIN USERS
  // ============================================

  async getAdminUser(email: string): Promise<AdminUserType | undefined> {
    try {
      const user = await AdminUser.findOne({ email, isActive: true }).lean();
      return user ? (user as AdminUserType) : undefined;
    } catch (error) {
      console.error('getAdminUser error:', error);
      throw new Error('Failed to fetch admin user');
    }
  }

  async getAdminUserById(id: string): Promise<AdminUserType | undefined> {
    try {
      const user = await AdminUser.findOne({ id, isActive: true }).lean();
      return user ? (user as AdminUserType) : undefined;
    } catch (error) {
      console.error('getAdminUserById error:', error);
      throw new Error('Failed to fetch admin user');
    }
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUserType> {
    try {
      const newUser = new AdminUser({
        id: `admin-${Date.now()}`,
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newUser.save();
      return newUser.toObject() as AdminUserType;
    } catch (error) {
      console.error('createAdminUser error:', error);
      throw new Error('Failed to create admin user');
    }
  }

  async updateAdminUserLogin(id: string): Promise<void> {
    try {
      await AdminUser.findOneAndUpdate(
        { id },
        { 
          $set: { 
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('updateAdminUserLogin error:', error);
      throw new Error('Failed to update admin user login');
    }
  }

  // ============================================
  // SESSION MANAGEMENT (In-Memory)
  // ============================================

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

  // ============================================
  // STATS
  // ============================================

  async getStats(): Promise<{ totalBrands: number; totalModels: number; totalVariants: number }> {
    try {
      const [totalBrands, totalModels, totalVariants] = await Promise.all([
        Brand.countDocuments(),
        Model.countDocuments(),
        Variant.countDocuments()
      ]);
      
      return { totalBrands, totalModels, totalVariants };
    } catch (error) {
      console.error('getStats error:', error);
      throw new Error('Failed to fetch stats');
    }
  }
}
