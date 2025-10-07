import { useState, useEffect } from 'react';
import { Vendor } from '../types/Product';
import { vendorService } from '../firebase/vendorService';
import { DEFAULT_VENDOR_ID } from '../utils/vendors';
import { useAuth } from './useAuth';

export const useVendors = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      // Initialize vendors if needed
      await vendorService.initializeVendors(user.uid);
      
      // Get all vendors
      const vendorsData = await vendorService.getVendors(user.uid);
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const addVendor = async (vendorData: Omit<Vendor, 'id'>) => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      const vendorId = await vendorService.addVendor(user.uid, vendorData);
      await loadVendors(); // Refresh the list
      return vendorId;
    } catch (err) {
      console.error('Error adding vendor:', err);
      throw err;
    }
  };

  const updateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      await vendorService.updateVendor(user.uid, vendorId, updates);
      await loadVendors(); // Refresh the list
    } catch (err) {
      console.error('Error updating vendor:', err);
      throw err;
    }
  };

  const deactivateVendor = async (vendorId: string) => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      await vendorService.deactivateVendor(user.uid, vendorId);
      await loadVendors(); // Refresh the list
    } catch (err) {
      console.error('Error deactivating vendor:', err);
      throw err;
    }
  };

  const getVendorById = (vendorId: string): Vendor | undefined => {
    return vendors.find(vendor => vendor.id === vendorId);
  };

  const getVendorName = (vendorId?: string): string => {
    if (!vendorId) return 'Unknown Vendor';
    const vendor = getVendorById(vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const getActiveVendors = (): Vendor[] => {
    return vendors.filter(vendor => vendor.isActive);
  };

  useEffect(() => {
    loadVendors();
  }, [user?.uid]);

  return {
    vendors,
    activeVendors: getActiveVendors(),
    loading,
    error,
    loadVendors,
    addVendor,
    updateVendor,
    deactivateVendor,
    getVendorById,
    getVendorName,
    DEFAULT_VENDOR_ID
  };
};