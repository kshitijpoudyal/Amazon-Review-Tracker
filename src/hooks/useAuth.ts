import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { initializeUserData } from '../utils/userUtils';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Initialize user data in Firestore
          await initializeUserData(user);
          setUser(user);
        } catch (error) {
          console.error('Error initializing user data:', error);
          // Still set the user even if initialization fails
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    logout
  };
};
