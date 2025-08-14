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

export const useFirebaseData = () => {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
    console.log('🔄 Fetching data from Firebase...');
    setLoading(true);
    setError(null);

    try {
      const productsSnap = await getDocs(collection(db, 'products'));

      const products: Product[] = productsSnap.docs.map(doc => {
        const data = doc.data();
        console.log(`📝 Product loaded: ${data.item} (ID: ${doc.id})`);
        return {
          id: doc.id,
          ...data
        } as Product;
      });
      console.log(`� Found ${products.length} products in Firebase`);

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

      console.log('✅ Successfully loaded data from Firebase:', {
        productCount: products.length,
        productNames: products.map(p => p.item),
        summary
      });
      setData(productData);
      console.log('🔄 State updated with new data');
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      console.log('✅ Fetch operation completed');
    }
  }, []);

  const saveProductToFirebase = async (product: Product): Promise<boolean> => {
    try {
      console.log('🔄 Updating existing product:', product.item, 'ID:', product.id);
      
      // Use the product's existing Firebase ID, not the array index
      if (!product.id) {
        console.error('❌ Cannot update product: missing Firebase ID');
        setError('Cannot update product: missing Firebase ID');
        return false;
      }
      
      const productRef = doc(db, 'products', product.id);
      
      const productData = {
        ...product,
        updatedAt: serverTimestamp()
      };

      await setDoc(productRef, productData, { merge: true });
      console.log('✅ Product updated in Firebase:', product.id);
      return true;
    } catch (err) {
      console.error('Error saving product to Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
      return false;
    }
  };

  const addProductToFirebase = async (product: Product): Promise<boolean> => {
    try {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
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
    try {
      const summaryRef = doc(db, 'dashboard', 'summary');
      
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
    try {
      const productRef = doc(db, 'products', productId);
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
  }, []);

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
