import { useMemo } from 'react';
import { PayPalTransaction } from '../types/PayPalTransaction';
import { getPayPalProductShare } from '../utils/paypalProductShare';
import { usePayPalTransactions } from './usePayPalTransactions';

export interface ProductPayPalLink {
  amount: number;
  transactionId: string;
}

function getProductShareFromTransaction(
  transaction: PayPalTransaction,
  productId: string,
): ProductPayPalLink | null {
  const linkedIds = transaction.linkedProductIds || [];
  if (!linkedIds.includes(productId) || transaction.total == null) return null;

  return {
    amount: getPayPalProductShare(transaction, productId),
    transactionId: transaction.transactionId || '',
  };
}

// Derives per-product PayPal links from the already-fetched, shared transactions
// list (see PayPalTransactionsProvider) instead of independently re-reading the
// whole paypal_transactions collection every time a product table mounts.
export const useProductPayPalLinks = (_userId?: string, productIds?: string[]) => {
  const { data, loading } = usePayPalTransactions();

  const { linkedProductIds, linkedPayPalByProduct } = useMemo(() => {
    const linkedIds = new Set<string>();
    const linksMap = new Map<string, ProductPayPalLink[]>();

    if (!productIds || productIds.length === 0 || !data?.transactions) {
      return { linkedProductIds: linkedIds, linkedPayPalByProduct: linksMap };
    }

    for (const transaction of data.transactions) {
      const linkedIdsOnTransaction = transaction.linkedProductIds;
      if (!linkedIdsOnTransaction || !Array.isArray(linkedIdsOnTransaction)) continue;

      for (const linkedId of linkedIdsOnTransaction) {
        if (!productIds.includes(linkedId)) continue;

        linkedIds.add(linkedId);
        const link = getProductShareFromTransaction(transaction, linkedId);
        if (!link) continue;

        const existing = linksMap.get(linkedId) || [];
        linksMap.set(linkedId, [...existing, link]);
      }
    }

    return { linkedProductIds: linkedIds, linkedPayPalByProduct: linksMap };
  }, [data?.transactions, productIds?.join(',')]);

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
