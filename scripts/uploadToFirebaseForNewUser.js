import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your service account key
const serviceAccountPath = path.resolve(__dirname, '../firebase-service-account.json');
const csvPath = path.resolve(__dirname, './template.csv');
const userId = 'NewUserIDHere'; // Replace with the new user's ID

// Format of CSV file:
// Item,orderPlaced,orderDelivered,reviewAdded,reviewLive,reviewSSSent,paid,received,delta

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Read and parse CSV
let csvContent = fs.readFileSync(csvPath, 'utf8');

// Remove BOM if present
if (csvContent.charCodeAt(0) === 0xFEFF) {
  csvContent = csvContent.slice(1);
}

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

function parseBool(val) {
  return val === 'Y';
}

function parseNum(val) {
  if (!val || val.trim() === '') return null;
  return Number(val);
}

async function uploadProducts() {
  console.log(`📁 Found ${records.length} products to upload for user: ${userId}`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    
    // Skip rows with missing item names
    if (!row.Item || row.Item.toString().trim() === '') {
      console.log(`⚠️  [${i + 1}/${records.length}] Skipping row with missing item name`);
      continue;
    }
    
    const paid = parseNum(row.paid);
    const received = parseNum(row.received);
    const delta = received !== null && paid !== null ? received - paid : null;
    
    const product = {
      item: row.Item.toString().trim(),
      orderDate: null, // Not present in CSV
      orderPlaced: parseBool(row.orderPlaced),
      orderDelivered: parseBool(row.orderDelivered),
      reviewAdded: parseBool(row.reviewAdded),
      reviewLive: parseBool(row.reviewLive),
      reviewSSSent: parseBool(row.reviewSSSent),
      paid: paid,
      received: received,
      delta: delta,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      const docRef = await db.collection('users').doc(userId).collection('products').add(product);
      await docRef.update({ id: docRef.id });
      console.log(`✅ [${i + 1}/${records.length}] Uploaded: ${product.item}`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${i + 1}/${records.length}] Failed to upload ${product.item}:`, error.message);
      failureCount++;
    }
  }
  
  console.log(`\n🎉 Upload completed!`);
  console.log(`✅ Successfully uploaded: ${successCount} products`);
  console.log(`❌ Failed uploads: ${failureCount} products`);
  process.exit(0);
}

uploadProducts().catch((error) => {
  console.error('💥 Upload failed:', error);
  process.exit(1);
});
