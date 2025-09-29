import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useProductPayPalLinks = (userId?: string, productIds?: string[]) => {
  const [linkedProductIds, setLinkedProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !productIds || productIds.length === 0) {
      setLinkedProductIds(new Set());
      return;
    }

    const fetchLinkedProducts = async () => {
      setLoading(true);
      try {
        // Query all PayPal transactions that have linkedProductIds in our product list
        const transactionsRef = collection(db, 'users', userId, 'paypal_transactions');
        const transactionsSnapshot = await getDocs(transactionsRef);
        
        const linkedIds = new Set<string>();
        transactionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.linkedProductIds && Array.isArray(data.linkedProductIds)) {
            data.linkedProductIds.forEach((linkedId: string) => {
              if (productIds.includes(linkedId)) {
                linkedIds.add(linkedId);
              }
            });
          }
        });

        setLinkedProductIds(linkedIds);
      } catch (error) {
        console.error('Error fetching linked products:', error);
        setLinkedProductIds(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedProducts();
  }, [userId, productIds?.join(',')]); // Re-run when productIds change

  const isProductLinked = (productId: string): boolean => {
    return linkedProductIds.has(productId);
  };

  return {
    linkedProductIds,
    isProductLinked,
    loading
  };
};
