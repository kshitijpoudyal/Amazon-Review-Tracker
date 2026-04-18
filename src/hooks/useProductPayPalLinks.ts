import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useProductPayPalLinks = (userId?: string, productIds?: string[]) => {
  const [linkedProductIds, setLinkedProductIds] = useState<Set<string>>(new Set());
  const [linkedAmounts, setLinkedAmounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !productIds || productIds.length === 0) {
      setLinkedProductIds(new Set());
      setLinkedAmounts(new Map());
      return;
    }

    const fetchLinkedProducts = async () => {
      setLoading(true);
      try {
        const transactionsRef = collection(db, 'users', userId, 'paypal_transactions');
        const transactionsSnapshot = await getDocs(transactionsRef);
        
        const linkedIds = new Set<string>();
        const amountsMap = new Map<string, number>();

        transactionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.linkedProductIds && Array.isArray(data.linkedProductIds)) {
            data.linkedProductIds.forEach((linkedId: string) => {
              if (productIds.includes(linkedId)) {
                linkedIds.add(linkedId);
                // Store the transaction total for the badge
                if (data.total != null) {
                  amountsMap.set(linkedId, data.total);
                }
              }
            });
          }
        });

        setLinkedProductIds(linkedIds);
        setLinkedAmounts(amountsMap);
      } catch (error) {
        console.error('Error fetching linked products:', error);
        setLinkedProductIds(new Set());
        setLinkedAmounts(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedProducts();
  }, [userId, productIds?.join(',')]);

  const isProductLinked = (productId: string): boolean => linkedProductIds.has(productId);
  const getLinkedAmount = (productId: string): number | null => linkedAmounts.get(productId) ?? null;

  return {
    linkedProductIds,
    isProductLinked,
    getLinkedAmount,
    loading
  };
};
