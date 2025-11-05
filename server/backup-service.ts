import fs from 'fs';
import path from 'path';
import type { IStorage } from './storage';

/**
 * Backup Service
 * Automatically backs up MongoDB data to JSON files
 * Runs after every create/update/delete operation
 */
export class BackupService {
  private storage: IStorage;
  private dataDir: string;
  private isBackupEnabled: boolean;

  constructor(storage: IStorage, dataDir: string = path.join(process.cwd(), 'data')) {
    this.storage = storage;
    this.dataDir = dataDir;
    this.isBackupEnabled = process.env.ENABLE_JSON_BACKUP !== 'false'; // Enabled by default
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    if (this.isBackupEnabled) {
      console.log('📦 JSON Backup Service: ENABLED');
      console.log(`📁 Backup Directory: ${this.dataDir}`);
    } else {
      console.log('📦 JSON Backup Service: DISABLED');
    }
  }

  /**
   * Backup all data to JSON files
   */
  async backupAll(): Promise<void> {
    if (!this.isBackupEnabled) return;

    try {
      console.log('🔄 Starting full backup to JSON files...');
      
      await Promise.all([
        this.backupBrands(),
        this.backupModels(),
        this.backupVariants(),
        this.backupAdminUsers(),
        this.backupPopularComparisons()
      ]);
      
      console.log('✅ Full backup completed successfully');
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup brands to JSON
   */
  async backupBrands(): Promise<void> {
    if (!this.isBackupEnabled) return;

    try {
      const brands = await this.storage.getBrands(true); // Include inactive
      const filePath = path.join(this.dataDir, 'brands.json');
      
      // Remove MongoDB-specific fields
      const cleanBrands = brands.map(brand => this.cleanMongoDocument(brand));
      
      fs.writeFileSync(filePath, JSON.stringify(cleanBrands, null, 2), 'utf-8');
      console.log(`✅ Backed up ${brands.length} brands to ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to backup brands:', error);
    }
  }

  /**
   * Backup models to JSON
   */
  async backupModels(): Promise<void> {
    if (!this.isBackupEnabled) return;

    try {
      const models = await this.storage.getModels(); // All models
      const filePath = path.join(this.dataDir, 'models.json');
      
      // Remove MongoDB-specific fields
      const cleanModels = models.map(model => this.cleanMongoDocument(model));
      
      fs.writeFileSync(filePath, JSON.stringify(cleanModels, null, 2), 'utf-8');
      console.log(`✅ Backed up ${models.length} models to ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to backup models:', error);
    }
  }

  /**
   * Backup variants to JSON
   */
  async backupVariants(): Promise<void> {
    if (!this.isBackupEnabled) return;

    try {
      const variants = await this.storage.getVariants(); // All variants
      const filePath = path.join(this.dataDir, 'variants.json');
      
      // Remove MongoDB-specific fields
      const cleanVariants = variants.map(variant => this.cleanMongoDocument(variant));
      
      fs.writeFileSync(filePath, JSON.stringify(cleanVariants, null, 2), 'utf-8');
      console.log(`✅ Backed up ${variants.length} variants to ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to backup variants:', error);
    }
  }

  /**
   * Backup admin users to JSON
   */
  async backupAdminUsers(): Promise<void> {
    if (!this.isBackupEnabled) return;

    try {
      // Note: We need to get all users, but we don't have a method for that
      // For now, we'll skip this or you can add a getAllAdminUsers method
      console.log('⚠️  Admin users backup skipped (no getAllUsers method)');
    } catch (error) {
      console.error('❌ Failed to backup admin users:', error);
    }
  }

  /**
   * Backup popular comparisons to JSON
   */
  async backupPopularComparisons(): Promise<void> {
    if (!this.isBackupEnabled) return;

    try {
      const comparisons = await this.storage.getPopularComparisons();
      const filePath = path.join(this.dataDir, 'popular-comparisons.json');
      
      // Remove MongoDB-specific fields
      const cleanComparisons = comparisons.map(comp => this.cleanMongoDocument(comp));
      
      fs.writeFileSync(filePath, JSON.stringify(cleanComparisons, null, 2), 'utf-8');
      console.log(`✅ Backed up ${comparisons.length} popular comparisons to ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to backup popular comparisons:', error);
    }
  }

  /**
   * Schedule automatic backups
   * @param intervalMinutes - Backup interval in minutes (default: 30)
   */
  startAutoBackup(intervalMinutes: number = 30): void {
    if (!this.isBackupEnabled) {
      console.log('📦 Auto-backup not started (backup disabled)');
      return;
    }

    console.log(`⏰ Auto-backup scheduled every ${intervalMinutes} minutes`);
    
    // Initial backup
    this.backupAll().catch(err => console.error('Initial backup failed:', err));
    
    // Schedule periodic backups
    setInterval(() => {
      console.log('⏰ Running scheduled backup...');
      this.backupAll().catch(err => console.error('Scheduled backup failed:', err));
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Remove MongoDB-specific fields from document
   */
  private cleanMongoDocument(doc: any): any {
    const cleaned = { ...doc };
    
    // Remove MongoDB internal fields
    delete cleaned._id;
    delete cleaned.__v;
    
    // Remove _id from nested arrays
    if (cleaned.faqs && Array.isArray(cleaned.faqs)) {
      cleaned.faqs = cleaned.faqs.map((faq: any) => {
        const { _id, ...rest } = faq;
        return rest;
      });
    }
    
    if (cleaned.galleryImages && Array.isArray(cleaned.galleryImages)) {
      cleaned.galleryImages = cleaned.galleryImages.map((img: any) => {
        const { _id, ...rest } = img;
        return rest;
      });
    }
    
    if (cleaned.keyFeatureImages && Array.isArray(cleaned.keyFeatureImages)) {
      cleaned.keyFeatureImages = cleaned.keyFeatureImages.map((img: any) => {
        const { _id, ...rest } = img;
        return rest;
      });
    }
    
    if (cleaned.spaceComfortImages && Array.isArray(cleaned.spaceComfortImages)) {
      cleaned.spaceComfortImages = cleaned.spaceComfortImages.map((img: any) => {
        const { _id, ...rest } = img;
        return rest;
      });
    }
    
    if (cleaned.storageConvenienceImages && Array.isArray(cleaned.storageConvenienceImages)) {
      cleaned.storageConvenienceImages = cleaned.storageConvenienceImages.map((img: any) => {
        const { _id, ...rest } = img;
        return rest;
      });
    }
    
    if (cleaned.colorImages && Array.isArray(cleaned.colorImages)) {
      cleaned.colorImages = cleaned.colorImages.map((img: any) => {
        const { _id, ...rest } = img;
        return rest;
      });
    }
    
    if (cleaned.engineSummaries && Array.isArray(cleaned.engineSummaries)) {
      cleaned.engineSummaries = cleaned.engineSummaries.map((eng: any) => {
        const { _id, ...rest } = eng;
        return rest;
      });
    }
    
    if (cleaned.mileageData && Array.isArray(cleaned.mileageData)) {
      cleaned.mileageData = cleaned.mileageData.map((mil: any) => {
        const { _id, ...rest } = mil;
        return rest;
      });
    }
    
    return cleaned;
  }

  /**
   * Create a timestamped backup
   */
  async createTimestampedBackup(): Promise<string> {
    if (!this.isBackupEnabled) {
      throw new Error('Backup is disabled');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.dataDir, 'backups', timestamp);
    
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Backup all data
    const brands = await this.storage.getBrands(true);
    const models = await this.storage.getModels();
    const variants = await this.storage.getVariants();
    const comparisons = await this.storage.getPopularComparisons();
    
    // Write to timestamped directory
    fs.writeFileSync(
      path.join(backupDir, 'brands.json'),
      JSON.stringify(brands.map(b => this.cleanMongoDocument(b)), null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'models.json'),
      JSON.stringify(models.map(m => this.cleanMongoDocument(m)), null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'variants.json'),
      JSON.stringify(variants.map(v => this.cleanMongoDocument(v)), null, 2)
    );
    fs.writeFileSync(
      path.join(backupDir, 'popular-comparisons.json'),
      JSON.stringify(comparisons.map(c => this.cleanMongoDocument(c)), null, 2)
    );
    
    console.log(`✅ Timestamped backup created: ${backupDir}`);
    return backupDir;
  }
}

// Export singleton instance creator
export function createBackupService(storage: IStorage): BackupService {
  return new BackupService(storage);
}
