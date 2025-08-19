#!/usr/bin/env node

// Script to create or verify user authentication for the migrated user ID
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

const TARGET_USER_ID = "puaFbqw0FbSBF6PNbm7h1NW9Jh83";
const TEST_EMAIL = "admin@amazontracker.com";
const TEST_PASSWORD = "password123";

async function setupTestUser() {
  console.log('🚀 Setting up test user authentication...');
  console.log('Target User ID:', TARGET_USER_ID);
  console.log('Test Email:', TEST_EMAIL);

  try {
    // First, try to create the user
    console.log('\n📋 Step 1: Creating user account...');
    
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
      console.log('✅ User account created successfully');
      console.log('   UID:', userCredential.user.uid);
      console.log('   Email:', userCredential.user.email);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  User account already exists, signing in...');
        userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        console.log('✅ Signed in successfully');
        console.log('   UID:', userCredential.user.uid);
      } else {
        throw error;
      }
    }

    // Step 2: Create/update user profile in Firestore
    console.log('\n📋 Step 2: Setting up user profile...');
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: 'Amazon Tracker Admin',
      photoURL: null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      setupAt: serverTimestamp()
    };

    await setDoc(userDocRef, userData, { merge: true });
    console.log('✅ User profile created/updated in Firestore');

    // Step 3: Verify data access
    console.log('\n📋 Step 3: Verifying data access...');
    
    if (userCredential.user.uid === TARGET_USER_ID) {
      console.log('✅ Perfect! User UID matches the migrated data target ID');
      console.log('   All products should be accessible immediately');
    } else {
      console.log('⚠️  User UID does not match the target ID');
      console.log('   Current UID:', userCredential.user.uid);
      console.log('   Target UID:', TARGET_USER_ID);
      console.log('   You may need to migrate data to the new UID or update the target ID');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📱 Login credentials for the app:');
    console.log('   Email:', TEST_EMAIL);
    console.log('   Password:', TEST_PASSWORD);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupTestUser()
  .then(() => {
    console.log('\n✅ Setup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  });
