import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, ProductData } from '../types/Product';

interface UserProfile {
  id?: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any;
  lastLoginAt: any;
}

export const useUserData = (username?: string) => {
  const [data, setData] = useState<ProductData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!username) {
      setLoading(false);
      setData(null);
      setUserProfile(null);
      return;
    }

    console.log('🔄 Fetching public data for username:', username);
    setLoading(true);
    setError(null);

    try {
      // First, find the user by email/username
      // We'll search users collection for a user with this email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', username),
        limit(1)
      );
      
      const usersSnap = await getDocs(usersQuery);
      
      let userId = null;
      let userProfileData = null;

      if (usersSnap.empty) {
        // Try searching by display name if email search fails
        const usersQueryByName = query(
          collection(db, 'users'),
          where('displayName', '==', username),
          limit(1)
        );
        
        const usersSnapByName = await getDocs(usersQueryByName);
        
        if (usersSnapByName.empty) {
          throw new Error('User not found');
        }
        
        const userDoc = usersSnapByName.docs[0];
        userId = userDoc.id;
        userProfileData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
      } else {
        const userDoc = usersSnap.docs[0];
        userId = userDoc.id;
        userProfileData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
      }

      setUserProfile(userProfileData);

      if (!userId) {
        throw new Error('User not found');
      }

      // Fetch user's products
      const productsSnap = await getDocs(collection(db, 'users', userId, 'products'));

      const products: Product[] = productsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Product;
      });

      console.log(`✅ Found ${products.length} products for user`);

      // Calculate summary from products
      const summary = {
        totalPaid: products.reduce((sum, product) => sum + (product.paid || 0), 0),
        totalReceived: products.reduce((sum, product) => sum + (product.received || 0), 0),
        netDelta: products.reduce((sum, product) => sum + (product.delta || 0), 0)
      };

      const productData: ProductData = {
        products,
        summary
      };

      setData(productData);
      console.log('✅ Successfully loaded public user data');
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    data,
    userProfile,
    loading,
    error,
    refetch: fetchUserData
  };
};
