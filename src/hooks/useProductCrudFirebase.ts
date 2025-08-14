import { useState, useCallback } from 'react';
import { Product } from '../types/Product';
import { useFirebaseData } from './useFirebaseData';

export const useProductCrudFirebase = () => {
  const { 
    data: firebaseData, 
    loading, 
    error, 
    saveProduct: saveToFirebase,
    addProduct: addToFirebase,
    deleteProduct: deleteFromFirebase,
    updateSummary: updateSummaryFirebase,
    refetch
  } = useFirebaseData();
  
  const [isSaving, setIsSaving] = useState(false);

  // Use Firebase data directly without local state
  const data = firebaseData;

  const updateProduct = useCallback(async (index: number, updatedProduct: Product) => {
    setIsSaving(true);
    try {
      console.log('🔄 Updating product at index:', index, 'Product:', updatedProduct.item, 'ID:', updatedProduct.id);
      
      // Save directly to Firebase
      const success = await saveToFirebase(updatedProduct);
      
      if (success && data) {
        // Recalculate and update summary
        const updatedProducts = [...data.products];
        updatedProducts[index] = updatedProduct;
        const summary = calculateSummary(updatedProducts);
        await updateSummaryFirebase(summary);
        
        // Refresh data from Firebase
        console.log('🔄 Refreshing data after update...');
        await refetch();
        console.log('✅ Data refreshed after update');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, saveToFirebase, updateSummaryFirebase, refetch]);

  const addProduct = useCallback(async (newProduct: Product) => {
    setIsSaving(true);
    try {
      console.log('🔄 Adding product:', newProduct.item);
      
      // Add directly to Firebase using the correct function
      const success = await addToFirebase(newProduct);
      console.log('✅ Product added to Firebase:', success);
      
      if (success) {
        console.log('🔄 Refreshing data from Firebase...');
        // Refresh data from Firebase
        await refetch();
        console.log('✅ Data refreshed from Firebase');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [addToFirebase, refetch]);

  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Delete from Firebase
      const success = await deleteFromFirebase(productId);
      
      if (success && data) {
        // Refresh data from Firebase after deletion
        await refetch();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [deleteFromFirebase, refetch, data]);

  const resetToFirebase = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
    resetToOriginal: resetToFirebase,
    saveToFirebase: () => Promise.resolve(true), // No longer needed since we save directly
    hasLocalChanges: false, // No local changes since we save directly
    isSaving,
    refreshFromFirebase: refetch
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
