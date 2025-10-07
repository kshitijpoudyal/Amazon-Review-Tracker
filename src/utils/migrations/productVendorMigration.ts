import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DEFAULT_VENDOR_ID } from '../vendors';

/**
 * Migration script to backfill products with default vendor
 * This script adds vendorId to all products that don't have one
 */
export async function backfillProductsWithVendor(userId?: string) {
  try {
    console.log('Starting product backfill migration...');
    
    if (userId) {
      // Backfill for specific user
      await backfillUserProducts(userId);
      console.log(`Backfill completed for user: ${userId}`);
    } else {
      // Find all users and backfill their products
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      for (const userDoc of usersSnapshot.docs) {
        console.log(`Processing products for user: ${userDoc.id}`);
        await backfillUserProducts(userDoc.id);
      }
      
      console.log('Backfill completed for all users');
    }
    
  } catch (error) {
    console.error('Error during backfill migration:', error);
    throw error;
  }
}

async function backfillUserProducts(userId: string) {
  try {
    const productsCollection = collection(db, `users/${userId}/products`);
    
    // Get all products that don't have a vendorId
    const q = query(productsCollection, where('vendorId', '==', null));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Also check for products where vendorId field doesn't exist at all
      const allProductsSnapshot = await getDocs(productsCollection);
      const productsWithoutVendor = allProductsSnapshot.docs.filter(
        doc => !doc.data().hasOwnProperty('vendorId') || doc.data().vendorId === undefined
      );
      
      if (productsWithoutVendor.length === 0) {
        console.log(`No products need backfilling for user: ${userId}`);
        return;
      }
      
      // Batch update products without vendorId field
      const batch = writeBatch(db);
      
      productsWithoutVendor.forEach((productDoc) => {
        const productRef = doc(db, `users/${userId}/products`, productDoc.id);
        batch.update(productRef, { vendorId: DEFAULT_VENDOR_ID });
      });
      
      await batch.commit();
      console.log(`Backfilled ${productsWithoutVendor.length} products for user: ${userId}`);
      return;
    }
    
    // Batch update products with null vendorId
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((productDoc) => {
      const productRef = doc(db, `users/${userId}/products`, productDoc.id);
      batch.update(productRef, { vendorId: DEFAULT_VENDOR_ID });
    });
    
    await batch.commit();
    console.log(`Backfilled ${snapshot.docs.length} products for user: ${userId}`);
    
  } catch (error) {
    console.error(`Error backfilling products for user ${userId}:`, error);
    throw error;
  }
}

// Helper function to run migration for current user
export async function runProductVendorMigration() {
  try {
    // You would typically get the current user ID from auth context
    // For now, this can be called manually with a specific user ID
    const userId = prompt('Enter user ID to migrate (leave empty for all users):');
    
    if (userId === null) {
      console.log('Migration cancelled');
      return;
    }
    
    await backfillProductsWithVendor(userId || undefined);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Export for use in console or admin scripts
if (typeof window !== 'undefined') {
  (window as any).runProductVendorMigration = runProductVendorMigration;
}