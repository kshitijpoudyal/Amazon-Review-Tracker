import {
  collection,
  getDocs,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DEFAULT_REVIEW_MEDIA_TYPE } from '../../types/Product';

const BATCH_LIMIT = 500;

export interface ReviewMediaTypeBackfillResult {
  updated: number;
}

async function backfillUserProductsReviewMediaType(userId: string): Promise<number> {
  const productsCollection = collection(db, `users/${userId}/products`);
  const snapshot = await getDocs(productsCollection);

  const toUpdate = snapshot.docs.filter(
    (productDoc) => productDoc.data().reviewMediaType !== DEFAULT_REVIEW_MEDIA_TYPE,
  );

  if (toUpdate.length === 0) {
    console.log(`No products need reviewMediaType backfill for user: ${userId}`);
    return 0;
  }

  let updated = 0;

  for (let i = 0; i < toUpdate.length; i += BATCH_LIMIT) {
    const chunk = toUpdate.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);

    chunk.forEach((productDoc) => {
      const productRef = doc(db, `users/${userId}/products`, productDoc.id);
      batch.update(productRef, { reviewMediaType: DEFAULT_REVIEW_MEDIA_TYPE });
    });

    await batch.commit();
    updated += chunk.length;
  }

  console.log(`Backfilled reviewMediaType on ${updated} products for user: ${userId}`);
  return updated;
}

/**
 * Sets reviewMediaType to "text" on all products that are not already text.
 */
export async function backfillProductsReviewMediaType(
  userId?: string,
): Promise<ReviewMediaTypeBackfillResult> {
  try {
    console.log('Starting reviewMediaType backfill migration...');

    if (userId) {
      const updated = await backfillUserProductsReviewMediaType(userId);
      console.log(`ReviewMediaType backfill completed for user: ${userId}`);
      return { updated };
    }

    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    let updated = 0;

    for (const userDoc of usersSnapshot.docs) {
      console.log(`Processing reviewMediaType for user: ${userDoc.id}`);
      updated += await backfillUserProductsReviewMediaType(userDoc.id);
    }

    console.log('ReviewMediaType backfill completed for all users');
    return { updated };
  } catch (error) {
    console.error('Error during reviewMediaType backfill migration:', error);
    throw error;
  }
}

export async function runProductReviewMediaTypeMigration() {
  try {
    const userId = prompt('Enter user ID to migrate (leave empty for all users):');

    if (userId === null) {
      console.log('Migration cancelled');
      return;
    }

    const result = await backfillProductsReviewMediaType(userId || undefined);
    console.log(`Migration completed successfully! Updated ${result.updated} products.`);
    return result;
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { runProductReviewMediaTypeMigration?: typeof runProductReviewMediaTypeMigration })
    .runProductReviewMediaTypeMigration = runProductReviewMediaTypeMigration;
}
