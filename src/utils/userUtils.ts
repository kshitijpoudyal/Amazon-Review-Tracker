import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';

export const initializeUserData = async (user: User): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // Only create user document if it doesn't exist
    if (!userDoc.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      await setDoc(userDocRef, userData);
    } else {
      // Update last login time for existing users
      await setDoc(userDocRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('❌ Error initializing user data:', error);
    throw error;
  }
};
