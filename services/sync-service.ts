import mongoose from 'mongoose';
import { indexDocument, updateDocument, deleteDocument, INDICES } from './elasticsearch';

/**
 * Real-time sync service using MongoDB Change Streams
 * Keeps Elasticsearch in sync with MongoDB automatically
 */

export function startSyncService() {
  // Watch Models collection
  const modelsCollection = mongoose.connection.collection('models');
  const modelsChangeStream = modelsCollection.watch([], { fullDocument: 'updateLookup' });

  modelsChangeStream.on('change', async (change) => {
    try {
      switch (change.operationType) {
        case 'insert':
          if (change.fullDocument) {
            await indexDocument(INDICES.MODELS, change.fullDocument._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Indexed new model: ${change.fullDocument.name}`);
          }
          break;

        case 'update':
          if (change.fullDocument) {
            await updateDocument(INDICES.MODELS, change.documentKey._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Updated model: ${change.fullDocument.name}`);
          }
          break;

        case 'delete':
          await deleteDocument(INDICES.MODELS, change.documentKey._id.toString());
          console.log(`✅ Deleted model from index`);
          break;

        case 'replace':
          if (change.fullDocument) {
            await indexDocument(INDICES.MODELS, change.fullDocument._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Replaced model: ${change.fullDocument.name}`);
          }
          break;
      }
    } catch (error) {
      console.error('❌ Error syncing model change:', error);
    }
  });

  // Watch Brands collection
  const brandsCollection = mongoose.connection.collection('brands');
  const brandsChangeStream = brandsCollection.watch([], { fullDocument: 'updateLookup' });

  brandsChangeStream.on('change', async (change) => {
    try {
      switch (change.operationType) {
        case 'insert':
          if (change.fullDocument) {
            await indexDocument(INDICES.BRANDS, change.fullDocument._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Indexed new brand: ${change.fullDocument.name}`);
          }
          break;

        case 'update':
          if (change.fullDocument) {
            await updateDocument(INDICES.BRANDS, change.fullDocument._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Updated brand: ${change.fullDocument.name}`);
          }
          break;

        case 'delete':
          await deleteDocument(INDICES.BRANDS, change.documentKey._id.toString());
          console.log(`✅ Deleted brand from index`);
          break;
      }
    } catch (error) {
      console.error('❌ Error syncing brand change:', error);
    }
  });

  // Watch Variants collection
  const variantsCollection = mongoose.connection.collection('variants');
  const variantsChangeStream = variantsCollection.watch([], { fullDocument: 'updateLookup' });

  variantsChangeStream.on('change', async (change) => {
    try {
      switch (change.operationType) {
        case 'insert':
          if (change.fullDocument) {
            await indexDocument(INDICES.VARIANTS, change.fullDocument._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Indexed new variant: ${change.fullDocument.name}`);
          }
          break;

        case 'update':
          if (change.fullDocument) {
            await updateDocument(INDICES.VARIANTS, change.fullDocument._id.toString(), {
              ...change.fullDocument,
              id: change.fullDocument._id.toString(),
            });
            console.log(`✅ Updated variant: ${change.fullDocument.name}`);
          }
          break;

        case 'delete':
          await deleteDocument(INDICES.VARIANTS, change.documentKey._id.toString());
          console.log(`✅ Deleted variant from index`);
          break;
      }
    } catch (error) {
      console.error('❌ Error syncing variant change:', error);
    }
  });

  console.log('✅ MongoDB Change Streams started - Real-time sync active');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    modelsChangeStream.close();
    brandsChangeStream.close();
    variantsChangeStream.close();
    console.log('✅ Change streams closed');
    process.exit(0);
  });
}
