#!/usr/bin/env node

// Script to migrate data from one user to another
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

const SOURCE_USER_ID = "puaFbqw0FbSBF6PNbm7h1NW9Jh83";
const TARGET_USER_ID = "uV4emSiV1GUaGhWPI4qv3r0QOM73"; // The newly created user

async function migrateUserData() {
  console.log('🚀 Migrating data between users...');
  console.log('Source User ID:', SOURCE_USER_ID);
  console.log('Target User ID:', TARGET_USER_ID);

  try {
    // Step 1: Get all products from the source user
    console.log('\n📋 Step 1: Fetching products from source user...');
    const productsSnap = await getDocs(collection(db, 'users', SOURCE_USER_ID, 'products'));
    
    if (productsSnap.empty) {
      console.log('❌ No products found for source user. Migration may have already been completed or user not found.');
      return;
    }

    const products = productsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${products.length} products to migrate`);

    // Step 2: Copy products to target user using batch writes
    console.log('\n📋 Step 2: Copying products to target user...');
    
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchProducts = products.slice(i, i + batchSize);
      
      batchProducts.forEach(product => {
        const targetProductRef = doc(db, 'users', TARGET_USER_ID, 'products', product.id);
        const productData = {
          ...product,
          migratedAt: serverTimestamp(),
          migratedFrom: SOURCE_USER_ID,
          updatedAt: serverTimestamp()
        };
        batch.set(targetProductRef, productData);
      });
      
      batches.push({ batch, count: batchProducts.length });
    }

    // Execute all batches
    for (let i = 0; i < batches.length; i++) {
      console.log(`   Writing batch ${i + 1}/${batches.length} (${batches[i].count} products)...`);
      await batches[i].batch.commit();
    }

    console.log(`✅ Successfully copied ${products.length} products to target user`);

    // Step 3: Calculate and save summary for target user
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
      migratedAt: serverTimestamp(),
      migratedFrom: SOURCE_USER_ID
    };

    const summaryRef = doc(db, 'users', TARGET_USER_ID, 'dashboard', 'summary');
    await setDoc(summaryRef, summary);

    console.log('✅ Summary saved for target user:', {
      totalProducts: summary.totalProducts,
      completedOrders: summary.completedOrders,
      totalPaid: `$${summary.totalPaid.toFixed(2)}`,
      totalReceived: `$${summary.totalReceived.toFixed(2)}`,
      netDelta: `$${summary.netDelta.toFixed(2)}`
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Migrated ${products.length} products from ${SOURCE_USER_ID} to ${TARGET_USER_ID}`);
    console.log('\n📱 You can now login with:');
    console.log('   Email: admin@amazontracker.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateUserData()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
