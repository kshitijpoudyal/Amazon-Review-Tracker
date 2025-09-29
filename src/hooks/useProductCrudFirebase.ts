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

  const updateProduct = useCallback(async (index: number, updatedProduct: Product) => {
    setIsSaving(true);
    try {
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
