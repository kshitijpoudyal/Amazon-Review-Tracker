import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './config';
import { Vendor } from '../types/Product';
import { DEFAULT_VENDORS } from '../utils/vendors';

export const vendorService = {
  // Initialize default vendors in Firestore with specific IDs for a user
  async initializeVendors(userId?: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to initialize vendors');
    }
    try {
      console.log('Initializing default vendors...');
      
      // Create each default vendor with specific document IDs in user's subcollection
      for (const vendor of DEFAULT_VENDORS) {
        try {
          const vendorDocRef = doc(db, `users/${userId}/vendors`, vendor.id);
          
          // Prepare clean vendor data
          const vendorData = {
            name: String(vendor.name),
            createdAt: new Date().toISOString(), // Always use fresh timestamp
            isActive: Boolean(vendor.isActive)
          };
          
          console.log(`Creating vendor with data:`, vendorData);
          
          // Use setDoc with merge to create or update the vendor document
          await setDoc(vendorDocRef, vendorData, { merge: true });
          
          console.log(`✓ Initialized vendor: ${vendor.name} (ID: ${vendor.id})`);
        } catch (vendorError) {
          console.error(`Failed to create vendor ${vendor.name}:`, vendorError);
          throw vendorError;
        }
      }
      
      console.log('Default vendors initialization completed successfully');
    } catch (error) {
      console.error('Error initializing vendors:', error);
      throw error;
    }
  },

  // Get all vendors for a user
  async getVendors(userId: string): Promise<Vendor[]> {
    try {
      const vendorsCollection = collection(db, `users/${userId}/vendors`);
      const q = query(vendorsCollection, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  },

  // Get active vendors only for a user
  async getActiveVendors(userId: string): Promise<Vendor[]> {
    try {
      const vendorsCollection = collection(db, `users/${userId}/vendors`);
      const q = query(
        vendorsCollection, 
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
    } catch (error) {
      console.error('Error getting active vendors:', error);
      throw error;
    }
  },

  // Add a new vendor for a user
  async addVendor(userId: string, vendorData: Omit<Vendor, 'id'>): Promise<string> {
    try {
      const vendorsCollection = collection(db, `users/${userId}/vendors`);
      const docRef = await addDoc(vendorsCollection, {
        ...vendorData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  },

  // Update vendor
  async updateVendor(userId: string, vendorId: string, updates: Partial<Vendor>): Promise<void> {
    try {
      const vendorDoc = doc(db, `users/${userId}/vendors`, vendorId);
      await updateDoc(vendorDoc, updates);
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  // Soft delete vendor (set isActive to false)
  async deactivateVendor(userId: string, vendorId: string): Promise<void> {
    try {
      const vendorDoc = doc(db, `users/${userId}/vendors`, vendorId);
      await updateDoc(vendorDoc, { isActive: false });
    } catch (error) {
      console.error('Error deactivating vendor:', error);
      throw error;
    }
  },

  // Hard delete vendor
  async deleteVendor(userId: string, vendorId: string): Promise<void> {
    try {
      const vendorDoc = doc(db, `users/${userId}/vendors`, vendorId);
      await deleteDoc(vendorDoc);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }
};