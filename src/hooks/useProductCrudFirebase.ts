import { useState, useCallback } from 'react';
import { Product } from '../types/Product';
import { useFirebaseData } from './useFirebaseData';
import { checkAndSendReminders, getProductsNeedingReminders } from '../utils/emailService';
import { useAuth } from './useAuth';

export const useProductCrudFirebase = (userId?: string) => {
  const { 
    data: firebaseData, 
    loading, 
    error, 
    saveProduct: saveToFirebase,
    addProduct: addToFirebase,
    deleteProduct: deleteFromFirebase,
    updateSummary: updateSummaryFirebase,
    importProductsFromCSV: importToFirebase,
    mutateLocal,
    refetch
  } = useFirebaseData(userId);
  
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Use Firebase data directly without local state
  const data = firebaseData;

  // Automatic email reminders are now handled by scheduled Firebase Function
  // Running daily at 9 AM EST instead of on every app load
  // This provides better user experience and reduces unnecessary API calls
  
  // Note: Automatic checking has been moved to Firebase Functions scheduled job
  // that runs daily at 9 AM EST. Users will receive emails automatically
  // without needing to open the app.

  // Manual function to check reminders (can be called by user action)
  const checkReturnWindowReminders = useCallback(async () => {
    if (!data?.products || !user?.email) {
      console.log('⚠️ Cannot check reminders: missing products data or user email');
      return { sent: 0, failed: 0 };
    }

    const productsNeedingReminders = getProductsNeedingReminders(data.products);
    
    if (productsNeedingReminders.length === 0) {
      console.log('✅ No products currently need return window reminders');
      return { sent: 0, failed: 0 };
    }

    try {
      const result = await checkAndSendReminders(data.products, user.email);
      console.log(`📧 Manual reminder check completed: ${result.sent} sent, ${result.failed} failed`);
      return result;
    } catch (error) {
      console.error('❌ Error in manual reminder check:', error);
      return { sent: 0, failed: 0 };
    }
  }, [data?.products, user?.email]);

  const updateProduct = useCallback(async (_index: number, updatedProduct: Product) => {
    // Optimistic update — match by ID, not index, because `index` comes from
    // filteredProducts (a subset) and would corrupt the full products array.
    mutateLocal(products => products.map(p => p.id === updatedProduct.id ? updatedProduct : p));

    setIsSaving(true);
    try {
      const success = await saveToFirebase(updatedProduct);
      if (!success) {
        console.error('❌ Save failed, reverting...');
        await refetch();
      } else {
        if (firebaseData) {
          const updated = firebaseData.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
          updateSummaryFirebase(calculateSummary(updated)).catch(() => {});
        }
      }
      return success;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      await refetch();
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [firebaseData, saveToFirebase, mutateLocal, updateSummaryFirebase, refetch]);

  const addProduct = useCallback(async (newProduct: Product) => {
    setIsSaving(true);
    try {
      // addToFirebase returns the created product (with its Firestore id) on
      // success, so we can update local state directly without a refetch.
      const created = await addToFirebase(newProduct);
      if (created) {
        mutateLocal(products => [...products, created]);
      }
      return !!created;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [addToFirebase, mutateLocal]);

  const importProductsFromCSV = useCallback(async (products: Product[]) => {
    setIsSaving(true);
    try {
      // importToFirebase already updates local state (via mutateLocal) on success.
      return await importToFirebase(products);
    } finally {
      setIsSaving(false);
    }
  }, [importToFirebase]);

  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    // Instant optimistic removal
    mutateLocal(products => products.filter(p => p.id !== productId));

    try {
      const success = await deleteFromFirebase(productId);
      if (!success) {
        // Revert on failure
        await refetch();
      }
      return success;
    } catch (error) {
      console.error('Error deleting product:', error);
      await refetch();
      return false;
    }
  }, [deleteFromFirebase, mutateLocal, refetch]);

  const resetToFirebase = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    importProductsFromCSV,
    deleteProduct,
    resetToOriginal: resetToFirebase,
    saveToFirebase: () => Promise.resolve(true), // No longer needed since we save directly
    hasLocalChanges: false, // No local changes since we save directly
    isSaving,
    refreshFromFirebase: refetch,
    checkReturnWindowReminders, // Manual reminder check function
    productsNeedingReminders: data?.products ? getProductsNeedingReminders(data.products) : []
  };
};

const calculateSummary = (products: Product[]) => {
  let totalPaid = 0;
  let totalReceived = 0;
  let netDelta = 0;

  products.forEach(product => {
    if (product.paid !== null && !isNaN(product.paid)) {
      totalPaid += product.paid;
    }
    if (product.received !== null && !isNaN(product.received)) {
      totalReceived += product.received;
    }
    if (product.delta !== null && !isNaN(product.delta)) {
      netDelta += product.delta;
    }
  });

  return {
    totalPaid,
    totalReceived,
    netDelta
  };
};
