// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// To get these values: Firebase Console > Project Settings > General > Web apps
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

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export default app;
