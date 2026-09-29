import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product, ProductData } from '../types/Product';
import { getProductStatusType } from '../utils/productStatus';

// ─── Cache helpers ──────────────────────────────────────────────────────────
const CACHE_VERSION = 'v1';
const cacheKey = (uid: string) => `art_products_${CACHE_VERSION}_${uid}`;

function readProductCache(uid: string): Product[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    if (!raw) return null;
    const { products } = JSON.parse(raw);
    return Array.isArray(products) ? products : null;
  } catch {
    return null;
  }
}

function writeProductCache(uid: string, products: Product[]): void {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify({ products, ts: Date.now() }));
  } catch {
    // Ignore quota errors
  }
}

function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function buildProductData(products: Product[]): ProductData {
  return {
    products,
    summary: {
      totalPaid: products.reduce((s, p) => s + (p.paid || 0), 0),
      totalReceived: products.reduce((s, p) => s + (p.received || 0), 0),
      netDelta: products.reduce((s, p) => s + (p.delta || 0), 0),
    }
  };
}
// ───────────────────────────────────────────────────────────────────────────

export const useFirebaseData = (userId?: string) => {
  // Read cache synchronously before first render so loading=false when data exists
  const initRef = useRef<{ data: ProductData | null; hasCache: boolean } | null>(null);
  if (!initRef.current) {
    const cached = userId ? readProductCache(userId) : null;
    initRef.current = { data: cached ? buildProductData(cached) : null, hasCache: !!cached };
  }

  const [data, setData] = useState<ProductData | null>(initRef.current.data);
  const [loading, setLoading] = useState(!initRef.current.hasCache);
  const [error, setError] = useState<string | null>(null);

  /** Optimistically update products in-memory and in cache without a Firebase round-trip. */
  const mutateLocal = useCallback((updater: (products: Product[]) => Product[]) => {
    setData(prev => {
      if (!prev) return prev;
      const next = updater(prev.products);
      if (userId) writeProductCache(userId, next);
      return buildProductData(next);
    });
  }, [userId]);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }

    // Only block UI with a spinner on the very first load (no cached data)
    if (!initRef.current?.hasCache) {
      setLoading(true);
    }
    setError(null);

    try {
      const productsSnap = await getDocs(collection(db, 'users', userId, 'products'));

      const products: Product[] = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      writeProductCache(userId, products);
      setData(buildProductData(products));
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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
      
      const newStatus = getProductStatusType(product);
      const statusChanged = product.lastStatus !== newStatus;

      const productData = omitUndefined({
        ...product,
        updatedAt: serverTimestamp(),
        lastStatus: newStatus,
        ...(statusChanged && { statusChangedAt: new Date().toISOString() }),
      });

      await setDoc(productRef, productData, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving product to Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
      return false;
    }
  };

  // Returns the created product (with its Firestore-assigned id) so callers can
  // update local state directly instead of re-reading the whole collection.
  const addProductToFirebase = async (product: Product): Promise<Product | null> => {
    if (!userId) return null;

    try {
      const initialStatus = getProductStatusType(product);
      const statusChangedAt = new Date().toISOString();
      const productData = omitUndefined({
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastStatus: initialStatus,
        statusChangedAt,
      });

      // A single write — the document's own id is already `doc.id`, so there's
      // no need for a second write just to duplicate it into the data.
      const docRef = await addDoc(collection(db, 'users', userId, 'products'), productData);

      return { ...product, id: docRef.id, lastStatus: initialStatus, statusChangedAt };
    } catch (err) {
      console.error('Error adding product to Firebase:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product');
      return null;
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

  // Firestore batched writes cap at 500 operations; chunk to stay under that.
  const BATCH_CHUNK_SIZE = 450;

  const importProductsFromCSV = async (products: Product[]): Promise<{ added: number; skipped: number }> => {
    if (!userId) return { added: 0, skipped: products.length };

    const productsCollection = collection(db, 'users', userId, 'products');
    const added: Product[] = [];
    let skipped = 0;

    for (let i = 0; i < products.length; i += BATCH_CHUNK_SIZE) {
      const chunk = products.slice(i, i + BATCH_CHUNK_SIZE);
      const batch = writeBatch(db);
      const chunkProducts: Product[] = [];

      for (const product of chunk) {
        const initialStatus = getProductStatusType(product);
        const statusChangedAt = new Date().toISOString();
        const productData = omitUndefined({
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastStatus: initialStatus,
          statusChangedAt,
        });

        const docRef = doc(productsCollection);
        batch.set(docRef, productData);
        chunkProducts.push({ ...product, id: docRef.id, lastStatus: initialStatus, statusChangedAt });
      }

      try {
        await batch.commit();
        added.push(...chunkProducts);
      } catch (err) {
        console.error('Error batch-importing products:', err);
        skipped += chunk.length;
      }
    }

    if (added.length > 0) {
      mutateLocal(existing => [...existing, ...added]);
    }

    return { added: added.length, skipped };
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutateLocal,
    saveProduct: saveProductToFirebase,
    addProduct: addProductToFirebase,
    deleteProduct: deleteProductFromFirebase,
    updateSummary: updateSummaryInFirebase,
    importProductsFromCSV,
  };
};
