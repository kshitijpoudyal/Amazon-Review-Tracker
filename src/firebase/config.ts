// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// To get these values: Firebase Console > Project Settings > General > Web apps
const firebaseConfig = {
  apiKey: "AIzaSyDK3rKnONH8QKX9V-ZeKrVe4v0tLr2QrYs", // Replace with your actual API key
  authDomain: "productreview-52e51.firebaseapp.com",
  projectId: "productreview-52e51",
  storageBucket: "productreview-52e51.appspot.com", 
  messagingSenderId: "101210868462203000846",
  appId: "1:101210868462203000846:web:abc123def456789" // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export default app;
