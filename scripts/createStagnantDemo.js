import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = resolve(__dirname, '../firebase-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Demo script to simulate stagnant products for testing
 */
async function createStagnantProductsDemo() {
  try {
    console.log('🎭 Creating demo stagnant products for testing...\n');
    
    // Get the first user with an email address
    const usersSnapshot = await db.collection('users').get();
    const usersWithEmail = usersSnapshot.docs
      .map(doc => ({ uid: doc.id, ...doc.data() }))
      .filter(user => user.email);

    if (usersWithEmail.length === 0) {
      console.log('❌ No users with email addresses found');
      return;
    }

    const demoUser = usersWithEmail[0];
    console.log(`🎯 Using user: ${demoUser.email}`);

    // Get user's products
    const productsSnapshot = await db
      .collection('users')
      .doc(demoUser.uid)
      .collection('products')
      .limit(5) // Only modify first 5 products
      .get();

    if (productsSnapshot.docs.length === 0) {
      console.log('❌ User has no products');
      return;
    }

    console.log(`📦 Found ${productsSnapshot.docs.length} products to modify\n`);

    // Create timestamps for stagnant products (15-30 days ago)
    const now = new Date();
    const timestamps = [
      new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
    ];

    const batch = db.batch();
    let updateCount = 0;

    productsSnapshot.docs.forEach((doc, index) => {
      const product = doc.data();
      const daysAgo = Math.floor((now.getTime() - new Date(timestamps[index]).getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`📝 Setting ${product.item} to ${daysAgo} days ago`);
      
      batch.update(doc.ref, {
        statusLastChanged: timestamps[index],
        lastNotificationSent: null // Reset notification timestamp
      });
      updateCount++;
    });

    await batch.commit();

    console.log(`\n✅ Successfully updated ${updateCount} products to simulate stagnant status`);
    console.log('🎬 Demo ready! Run "npm run test-notifications" to see the results');
    
  } catch (error) {
    console.error('❌ Error creating demo:', error);
  }
}

createStagnantProductsDemo();
