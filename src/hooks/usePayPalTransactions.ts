import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { PayPalTransaction, PayPalTransactionData } from '../types/PayPalTransaction';

// ─── Cache helpers ──────────────────────────────────────────────────────────
const CACHE_VERSION = 'v1';
const ppCacheKey = (uid: string) => `art_paypal_${CACHE_VERSION}_${uid}`;

function readPayPalCache(uid: string): PayPalTransaction[] | null {
  try {
    const raw = localStorage.getItem(ppCacheKey(uid));
    if (!raw) return null;
    const { transactions } = JSON.parse(raw);
    return Array.isArray(transactions) ? transactions : null;
  } catch {
    return null;
  }
}

function writePayPalCache(uid: string, transactions: PayPalTransaction[]): void {
  try {
    localStorage.setItem(ppCacheKey(uid), JSON.stringify({ transactions, ts: Date.now() }));
  } catch {}
}

function buildTransactionData(transactions: PayPalTransaction[]): PayPalTransactionData {
  return {
    transactions,
    summary: {
      totalIncome: transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      totalFees: transactions.reduce((s, t) => s + Math.abs(t.fees), 0),
      netReceivedTotal: transactions.reduce((s, t) => s + t.total, 0),
      transactionCount: transactions.length
    }
  };
}
// ───────────────────────────────────────────────────────────────────────────

export const usePayPalTransactions = (userId?: string) => {
  // Synchronously read cache before first render
  const initRef = useRef<{ data: PayPalTransactionData | null; hasCache: boolean } | null>(null);
  if (!initRef.current) {
    const cached = userId ? readPayPalCache(userId) : null;
    initRef.current = { data: cached ? buildTransactionData(cached) : null, hasCache: !!cached };
  }

  const [data, setData] = useState<PayPalTransactionData | null>(initRef.current.data);
  const [loading, setLoading] = useState(!initRef.current.hasCache);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }

    // Only block UI if no cached data to show
    if (!initRef.current?.hasCache) {
      setLoading(true);
    }
    setError(null);

    try {
      const transactionsRef = collection(db, 'users', userId, 'paypal_transactions');
      const transactionsQuery = query(transactionsRef, orderBy('date', 'desc'));
      const transactionsSnap = await getDocs(transactionsQuery);

      const transactions: PayPalTransaction[] = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PayPalTransaction));

      // Client-side sorting by date and time (most recent first)
      transactions.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time);
      });

      writePayPalCache(userId, transactions);
      setData(buildTransactionData(transactions));
    } catch (error) {
      console.error('❌ Error fetching PayPal transactions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addTransactionToFirebase = async (transaction: PayPalTransaction): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Skip "User Initiated Withdrawal" transactions
      if (transaction.type === 'User Initiated Withdrawal') {
        return false;
      }

      // Check if transaction with same transactionId already exists
      const existingQuery = query(
        collection(db, 'users', userId, 'paypal_transactions'),
        where('transactionId', '==', transaction.transactionId)
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        return false; // Transaction already exists
      }

      const transactionData = {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', userId, 'paypal_transactions'), transactionData);
      
      return true;
    } catch (err) {
      console.error('Error adding PayPal transaction to Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      return false;
    }
  };

  const importTransactionsFromCSV = async (transactions: PayPalTransaction[]): Promise<{ added: number; skipped: number; withdrawalSkipped: number }> => {
    if (!userId) return { added: 0, skipped: 0, withdrawalSkipped: 0 };

    let added = 0;
    let skipped = 0;
    let withdrawalSkipped = 0;

    for (const transaction of transactions) {
      if (transaction.type === 'User Initiated Withdrawal') {
        withdrawalSkipped++;
        continue;
      }
      
      const success = await addTransactionToFirebase(transaction);
      if (success) {
        added++;
      } else {
        skipped++;
      }
    }

    // Refresh data after import
    await fetchTransactions();

    return { added, skipped, withdrawalSkipped };
  };

  const updateTransactionProductLink = async (transactionId: string, linkedProductIds: string[]): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Get the current transaction to check its previous linked products
      const transactionRef = doc(db, 'users', userId, 'paypal_transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      const currentTransaction = transactionSnap.data();
      const previousLinkedProductIds = currentTransaction?.linkedProductIds || [];

      // Update the transaction link
      await updateDoc(transactionRef, {
        linkedProductIds: linkedProductIds.length > 0 ? linkedProductIds : null,
        updatedAt: serverTimestamp()
      });
      
      // Refresh transaction data
      await fetchTransactions();
      
      // Update product received amounts for affected products
      // Update previously linked products that are no longer linked
      for (const prevProductId of previousLinkedProductIds) {
        if (!linkedProductIds.includes(prevProductId)) {
          await updateProductReceivedAmount(prevProductId);
        }
      }
      
      // Update newly linked products
      for (const productId of linkedProductIds) {
        if (!previousLinkedProductIds.includes(productId)) {
          await updateProductReceivedAmount(productId);
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error updating PayPal transaction product link:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product link');
      return false;
    }
  };

  const updateProductReceivedAmount = async (productId: string): Promise<void> => {
    if (!userId) return;

    try {
      // Fetch fresh transaction data to ensure accuracy
      const transactionsRef = collection(db, 'users', userId, 'paypal_transactions');
      const transactionsSnapshot = await getDocs(transactionsRef);
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PayPalTransaction[];

      // Calculate total received amount from all linked transactions
      const linkedTransactions = transactions.filter(
        transaction => transaction.linkedProductIds && transaction.linkedProductIds.includes(productId)
      );
      
      const totalReceived = linkedTransactions.reduce(
        (sum, transaction) => sum + transaction.total, 0
      );

      // Update the product's received amount
      const productRef = doc(db, 'users', userId, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const paid = productData.paid || 0;
        const delta = totalReceived - paid;

        await updateDoc(productRef, {
          received: totalReceived,
          delta: delta,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error updating product received amount:', err);
    }
  };

  const deleteTransactionFromFirebase = async (transactionId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const transactionRef = doc(db, 'users', userId, 'paypal_transactions', transactionId);
      await deleteDoc(transactionRef);
      return true;
    } catch (err) {
      console.error('Error deleting PayPal transaction from Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    data,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction: addTransactionToFirebase,
    importTransactions: importTransactionsFromCSV,
    deleteTransaction: deleteTransactionFromFirebase,
    updateProductLink: updateTransactionProductLink
  };
};
