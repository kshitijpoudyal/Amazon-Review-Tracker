import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface ProductPayPalLink {
  amount: number;
  transactionId: string;
}

function getProductShareFromTransaction(
  transaction: {
    total?: number;
    linkedProductIds?: string[];
    splitPrice?: boolean;
    transactionId?: string;
  },
  productId: string,
): ProductPayPalLink | null {
  const linkedIds = transaction.linkedProductIds || [];
  if (!linkedIds.includes(productId) || transaction.total == null) return null;

  const amount =
    transaction.splitPrice && linkedIds.length > 1
      ? transaction.total / linkedIds.length
      : transaction.total;

  return {
    amount,
    transactionId: transaction.transactionId || '',
  };
}

export const useProductPayPalLinks = (userId?: string, productIds?: string[]) => {
  const [linkedProductIds, setLinkedProductIds] = useState<Set<string>>(new Set());
  const [linkedPayPalByProduct, setLinkedPayPalByProduct] = useState<Map<string, ProductPayPalLink[]>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !productIds || productIds.length === 0) {
      setLinkedProductIds(new Set());
      setLinkedPayPalByProduct(new Map());
      return;
    }

    const fetchLinkedProducts = async () => {
      setLoading(true);
      try {
        const transactionsRef = collection(db, 'users', userId, 'paypal_transactions');
        const transactionsSnapshot = await getDocs(transactionsRef);

        const linkedIds = new Set<string>();
        const linksMap = new Map<string, ProductPayPalLink[]>();

        transactionsSnapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (!data.linkedProductIds || !Array.isArray(data.linkedProductIds)) return;

          data.linkedProductIds.forEach((linkedId: string) => {
            if (!productIds.includes(linkedId)) return;

            linkedIds.add(linkedId);
            const link = getProductShareFromTransaction(
              { ...data, transactionId: data.transactionId || docSnap.id },
              linkedId,
            );
            if (!link) return;

            const existing = linksMap.get(linkedId) || [];
            linksMap.set(linkedId, [...existing, link]);
          });
        });

        setLinkedProductIds(linkedIds);
        setLinkedPayPalByProduct(linksMap);
      } catch (error) {
        console.error('Error fetching linked products:', error);
        setLinkedProductIds(new Set());
        setLinkedPayPalByProduct(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedProducts();
  }, [userId, productIds?.join(',')]);

  const isProductLinked = (productId: string): boolean => linkedProductIds.has(productId);
  const getLinkedPayPalLinks = (productId: string): ProductPayPalLink[] =>
    linkedPayPalByProduct.get(productId) ?? [];
  const getLinkedAmount = (productId: string): number | null => {
    const links = getLinkedPayPalLinks(productId);
    if (links.length === 0) return null;
    return links.reduce((sum, link) => sum + link.amount, 0);
  };

  return {
    linkedProductIds,
    isProductLinked,
    getLinkedPayPalLinks,
    getLinkedAmount,
    loading,
  };
};
