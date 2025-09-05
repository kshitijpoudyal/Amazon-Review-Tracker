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
 * Test script to check for stagnant products and simulate notifications
 */
async function testNotificationSystem() {
  try {
    console.log('🧪 Testing notification system...\n');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    console.log(`👥 Found ${users.length} users to check\n`);

    for (const user of users) {
      if (!user.email) {
        console.log(`⚠️ Skipping user ${user.uid} - no email address\n`);
        continue;
      }

      console.log(`🔍 Checking user: ${user.email}`);

      // Get user's products
      const productsSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .collection('products')
        .get();

      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📦 Found ${products.length} products`);

      if (products.length === 0) {
        console.log(`📭 No products found for user\n`);
        continue;
      }

      // Check each product's status tracking
      const productsWithStatus = products.map(product => {
        const hasStatusTracking = !!product.statusLastChanged;
        const daysSinceChange = product.statusLastChanged 
          ? Math.floor((new Date().getTime() - new Date(product.statusLastChanged).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        return {
          ...product,
          hasStatusTracking,
          daysSinceChange
        };
      });

      // Report status tracking coverage
      const withTracking = productsWithStatus.filter(p => p.hasStatusTracking);
      const withoutTracking = productsWithStatus.filter(p => !p.hasStatusTracking);
      
      console.log(`✅ Products with status tracking: ${withTracking.length}`);
      console.log(`❌ Products without status tracking: ${withoutTracking.length}`);

      if (withoutTracking.length > 0) {
        console.log(`⚠️ Products missing status tracking:`);
        withoutTracking.forEach(p => {
          console.log(`   - ${p.item}`);
        });
      }

      // Find potentially stagnant products (14+ days)
      const stagnantProducts = withTracking.filter(p => p.daysSinceChange >= 14);
      
      if (stagnantProducts.length > 0) {
        console.log(`🚨 Found ${stagnantProducts.length} stagnant products (14+ days):`);
        stagnantProducts.forEach(p => {
          console.log(`   - ${p.item}: ${p.daysSinceChange} days since last change`);
        });
        
        console.log(`📧 Would send notification to: ${user.email}`);
      } else {
        console.log(`✅ No stagnant products found`);
      }

      console.log(''); // Empty line for readability
    }

    console.log('🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  }
}

/**
 * Function to add status tracking to existing products (migration)
 */
async function migrateExistingProducts() {
  try {
    console.log('🔄 Migrating existing products to add status tracking...\n');
    
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    let totalUpdated = 0;

    for (const user of users) {
      console.log(`🔍 Processing user: ${user.email || user.uid}`);
      
      const productsSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .collection('products')
        .get();

      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data()
      }));

      const productsToUpdate = products.filter(p => !p.statusLastChanged);
      
      if (productsToUpdate.length === 0) {
        console.log(`✅ All products already have status tracking`);
        continue;
      }

      console.log(`📝 Updating ${productsToUpdate.length} products...`);

      const batch = db.batch();
      const now = new Date().toISOString();

      productsToUpdate.forEach(product => {
        batch.update(product.ref, {
          statusLastChanged: now
        });
      });

      await batch.commit();
      totalUpdated += productsToUpdate.length;
      
      console.log(`✅ Updated ${productsToUpdate.length} products for user`);
    }

    console.log(`\n🎉 Migration completed! Updated ${totalUpdated} products total.`);
    
  } catch (error) {
    console.error('❌ Error migrating products:', error);
  }
}

// Get command line argument
const command = process.argv[2];

if (command === 'migrate') {
  migrateExistingProducts();
} else {
  testNotificationSystem();
}

console.log('\nUsage:');
console.log('  node testNotifications.js        - Test notification system');
console.log('  node testNotifications.js migrate - Migrate existing products');
