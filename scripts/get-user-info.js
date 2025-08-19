#!/usr/bin/env node

// Script to get user information for testing the user page
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function getUserInfo() {
  console.log('🔍 Fetching user information...');

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    
    if (usersSnap.empty) {
      console.log('❌ No users found');
      return;
    }

    console.log('\n📋 Available users:');
    console.log('==================');

    usersSnap.docs.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`\n${index + 1}. User ID: ${doc.id}`);
      console.log(`   Email: ${userData.email || 'N/A'}`);
      console.log(`   Display Name: ${userData.displayName || 'N/A'}`);
      console.log(`   Created: ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}`);
      
      // Show user page URLs
      if (userData.email) {
        console.log(`   🌐 User Page URL: http://localhost:3000/${userData.email}`);
      }
      if (userData.displayName) {
        console.log(`   🌐 User Page URL (by name): http://localhost:3000/${userData.displayName}`);
      }
    });

    console.log('\n📱 You can access any user page by visiting:');
    console.log('   http://localhost:3000/<email> or http://localhost:3000/<displayName>');
    
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    process.exit(1);
  }
}

// Run the script
getUserInfo()
  .then(() => {
    console.log('\n✅ User info script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User info script failed:', error);
    process.exit(1);
  });
