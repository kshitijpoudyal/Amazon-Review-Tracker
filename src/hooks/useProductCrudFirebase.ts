import { useState, useCallback } from 'react';
import { Product } from '../types/Product';
import { useFirebaseData } from './useFirebaseData';

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

  const [isSaving, setIsSaving] = useState(false);

  // Use Firebase data directly without local state
  const data = firebaseData;

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
