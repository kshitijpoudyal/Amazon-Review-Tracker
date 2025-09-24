import { useState, useEffect, useCallback } from 'react';
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

export const usePayPalTransactions = (userId?: string) => {
  const [data, setData] = useState<PayPalTransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionsRef = collection(db, 'users', userId, 'paypal_transactions');
      // Simplified query with single orderBy to avoid composite index requirement
      const transactionsQuery = query(transactionsRef, orderBy('date', 'desc'));
      const transactionsSnap = await getDocs(transactionsQuery);

      const transactions: PayPalTransaction[] = transactionsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as PayPalTransaction;
      });

      // Client-side sorting by date and time (most recent first)
      transactions.sort((a, b) => {
        // First sort by date
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        // If dates are equal, sort by time
        return b.time.localeCompare(a.time);
      });

      // Calculate summary from transactions
      const summary = {
        totalIncome: transactions
          .filter(t => t.amount > 0)
          .reduce((sum, transaction) => sum + transaction.amount, 0),
        totalFees: transactions
          .reduce((sum, transaction) => sum + Math.abs(transaction.fees), 0),
        netReceivedTotal: transactions
          .reduce((sum, transaction) => sum + transaction.total, 0),
        transactionCount: transactions.length
      };

      const transactionData: PayPalTransactionData = {
        transactions,
        summary
      };

      setData(transactionData);
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

  const updateTransactionProductLink = async (transactionId: string, linkedProductId: string | null): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Get the current transaction to check its previous linked product
      const transactionRef = doc(db, 'users', userId, 'paypal_transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      const currentTransaction = transactionSnap.data();
      const previousLinkedProductId = currentTransaction?.linkedProductId;

      // Update the transaction link
      await updateDoc(transactionRef, {
        linkedProductId: linkedProductId || null,
        updatedAt: serverTimestamp()
      });
      
      // Refresh transaction data
      await fetchTransactions();
      
      // Update product received amounts for affected products
      if (previousLinkedProductId) {
        await updateProductReceivedAmount(previousLinkedProductId);
      }
      if (linkedProductId && linkedProductId !== previousLinkedProductId) {
        await updateProductReceivedAmount(linkedProductId);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating PayPal transaction product link:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product link');
      return false;
    }
  };

  const updateTransactionMultipleProductLinks = async (transactionId: string, linkedProductIds: string[]): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Get the current transaction to check its previous linked products
      const transactionRef = doc(db, 'users', userId, 'paypal_transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      const currentTransaction = transactionSnap.data();
      const previousLinkedProductIds = currentTransaction?.linkedProductIds || [];
      const previousSingleLinkedProductId = currentTransaction?.linkedProductId;

      // Update the transaction with new multiple links
      await updateDoc(transactionRef, {
        linkedProductIds: linkedProductIds.length > 0 ? linkedProductIds : null,
        // For backward compatibility, also set single linkedProductId to first product if any
        linkedProductId: linkedProductIds.length > 0 ? linkedProductIds[0] : null,
        updatedAt: serverTimestamp()
      });
      
      // Refresh transaction data
      await fetchTransactions();
      
      // Update product received amounts for all affected products
      const allAffectedProductIds = new Set([
        ...previousLinkedProductIds,
        ...linkedProductIds,
        ...(previousSingleLinkedProductId ? [previousSingleLinkedProductId] : [])
      ]);

      for (const productId of allAffectedProductIds) {
        await updateProductReceivedAmount(productId);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating PayPal transaction multiple product links:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product links');
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
        transaction => 
          transaction.linkedProductId === productId || 
          (transaction.linkedProductIds && transaction.linkedProductIds.includes(productId))
      );
      
      const totalReceived = linkedTransactions.reduce((sum, transaction) => {
        // Count how many products are linked to this transaction
        let linkedProductCount = 0;
        
        // Count single linked product
        if (transaction.linkedProductId) {
          linkedProductCount += 1;
        }
        
        // Count multiple linked products
        if (transaction.linkedProductIds && transaction.linkedProductIds.length > 0) {
          linkedProductCount += transaction.linkedProductIds.length;
        }
        
        // Divide transaction amount equally among all linked products
        const sharePerProduct = linkedProductCount > 0 ? transaction.total / linkedProductCount : 0;
        
        return sum + sharePerProduct;
      }, 0);

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
    updateProductLink: updateTransactionProductLink,
    updateMultipleProductLinks: updateTransactionMultipleProductLinks
  };
};
