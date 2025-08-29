import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, ProductData } from '../types/Product';

export const useFirebaseData = (userId?: string) => {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productsSnap = await getDocs(collection(db, 'users', userId, 'products'));

      const products: Product[] = productsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Product;
      });

      // Calculate summary from products
      const summary = {
        totalPaid: products.reduce((sum, product) => sum + (product.paid || 0), 0),
        totalReceived: products.reduce((sum, product) => sum + (product.received || 0), 0),
        netDelta: products.reduce((sum, product) => sum + (product.delta || 0), 0)
      };

      const productData: ProductData = {
        products,
        summary
      };

      setData(productData);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveProductToFirebase = async (product: Product): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Use the product's existing Firebase ID, not the array index
      if (!product.id) {
        setError('Cannot update product: missing Firebase ID');
        return false;
      }
      
      const productRef = doc(db, 'users', userId, 'products', product.id);
      
      const productData = {
        ...product,
        updatedAt: serverTimestamp()
      };

      await setDoc(productRef, productData, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving product to Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
      return false;
    }
  };

  const addProductToFirebase = async (product: Product): Promise<boolean> => {
    if (!userId) return false;

    try {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'users', userId, 'products'), productData);
      
      // Update the document with its own ID
      await updateDoc(docRef, {
        id: docRef.id
      });

      return true;
    } catch (err) {
      console.error('Error adding product to Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product');
      return false;
    }
  };

  const updateSummaryInFirebase = async (summary: any): Promise<boolean> => {
    if (!userId) return false;

    try {
      const summaryRef = doc(db, 'users', userId, 'dashboard', 'summary');
      
      await setDoc(summaryRef, {
        ...summary,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      return true;
    } catch (err) {
      console.error('Error updating summary in Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to update summary');
      return false;
    }
  };

  const deleteProductFromFirebase = async (productId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const productRef = doc(db, 'users', userId, 'products', productId);
      await deleteDoc(productRef);
      return true;
    } catch (err) {
      console.error('Error deleting product from Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    saveProduct: saveProductToFirebase,
    addProduct: addProductToFirebase,
    deleteProduct: deleteProductFromFirebase,
    updateSummary: updateSummaryInFirebase
  };
};
