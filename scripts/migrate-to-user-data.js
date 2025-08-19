#!/usr/bin/env node

// Migration script to move all products from root collection to user-specific collection
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2tHEvgf-V9QcYWFCf2Q7TZv9wG4rFycw",
  authDomain: "productreview-52e51.firebaseapp.com",
  projectId: "productreview-52e51",
  storageBucket: "productreview-52e51.firebasestorage.app", 
  messagingSenderId: "342787037666",
  appId: "1:342787037666:web:da524575500029a12181bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TARGET_USER_ID = "puaFbqw0FbSBF6PNbm7h1NW9Jh83";

async function migrateData() {
  console.log('🚀 Starting migration to user-specific data structure...');
  console.log('Target User ID:', TARGET_USER_ID);

  try {
    // Step 1: Get all products from the root 'products' collection
    console.log('\n📋 Step 1: Fetching all products from root collection...');
    const productsSnap = await getDocs(collection(db, 'products'));
    
    if (productsSnap.empty) {
      console.log('❌ No products found in root collection. Migration may have already been completed.');
      return;
    }

    const products = productsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${products.length} products to migrate`);

    // Step 2: Create user-specific products collection using batch writes
    console.log('\n📋 Step 2: Creating user-specific products collection...');
    
    // Use batches to handle large number of products (max 500 operations per batch)
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchProducts = products.slice(i, i + batchSize);
      
      batchProducts.forEach(product => {
        const userProductRef = doc(db, 'users', TARGET_USER_ID, 'products', product.id);
        const productData = {
          ...product,
          migratedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(userProductRef, productData);
      });
      
      batches.push({ batch, count: batchProducts.length });
    }

    // Execute all batches
    for (let i = 0; i < batches.length; i++) {
      console.log(`   Writing batch ${i + 1}/${batches.length} (${batches[i].count} products)...`);
      await batches[i].batch.commit();
    }

    console.log(`✅ Successfully migrated ${products.length} products to user collection`);

    // Step 3: Calculate and save summary
    console.log('\n📋 Step 3: Calculating and saving summary...');
    
    let totalPaid = 0;
    let totalReceived = 0;
    let netDelta = 0;
    let completedOrders = 0;

    products.forEach(product => {
      if (product.paid !== null && !isNaN(product.paid)) {
        totalPaid += product.paid;
      }
      if (product.received !== null && !isNaN(product.received)) {
        totalReceived += product.received;
      }
      if (product.delta !== null && !isNaN(product.delta)) {
        netDelta += product.delta;
      }

      // Count completed orders
      if (product.orderPlaced && 
          product.orderDelivered && 
          product.reviewAdded && 
          product.reviewLive && 
          product.reviewSSSent &&
          product.paid !== null &&
          product.received !== null) {
        completedOrders++;
      }
    });

    const summary = {
      totalProducts: products.length,
      completedOrders,
      totalPaid,
      totalReceived,
      netDelta,
      lastUpdated: serverTimestamp(),
      migratedAt: serverTimestamp()
    };

    const summaryRef = doc(db, 'users', TARGET_USER_ID, 'dashboard', 'summary');
    await setDoc(summaryRef, summary);

    console.log('✅ Summary saved:', {
      totalProducts: summary.totalProducts,
      completedOrders: summary.completedOrders,
      totalPaid: `$${summary.totalPaid.toFixed(2)}`,
      totalReceived: `$${summary.totalReceived.toFixed(2)}`,
      netDelta: `$${summary.netDelta.toFixed(2)}`
    });

    // Step 4: Cleanup - Delete old collections (commented out for safety)
    console.log('\n📋 Step 4: Cleanup (SKIPPED for safety)');
    console.log('⚠️  Old collections are left intact for safety. You can manually delete them after verifying the migration.');
    console.log('   - Root products collection: /products');
    console.log('   - Root dashboard collection: /dashboard');

    /*
    // Uncomment this section only after verifying the migration is successful
    console.log('\n📋 Step 4: Cleaning up old collections...');
    
    const deletePromises = productsSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('✅ Deleted old products collection');

    // Also delete old dashboard/summary if it exists
    try {
      await deleteDoc(doc(db, 'dashboard', 'summary'));
      console.log('✅ Deleted old summary document');
    } catch (error) {
      console.log('ℹ️  No old summary document found to delete');
    }
    */

    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Migrated ${products.length} products to user: ${TARGET_USER_ID}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
