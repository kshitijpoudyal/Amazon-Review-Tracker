import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { Vendor } from '../types/Product';
import { vendorService } from '../firebase/vendorService';
import { DEFAULT_VENDOR_ID } from '../utils/vendors';

// ─── Cache helpers ──────────────────────────────────────────────────────────
const CACHE_VERSION = 'v1';
const cacheKey = (uid: string) => `art_vendors_${CACHE_VERSION}_${uid}`;

function readVendorCache(uid: string): Vendor[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    if (!raw) return null;
    const { vendors } = JSON.parse(raw);
    return Array.isArray(vendors) ? vendors : null;
  } catch {
    return null;
  }
}

function writeVendorCache(uid: string, vendors: Vendor[]): void {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify({ vendors, ts: Date.now() }));
  } catch {
    // Ignore quota errors
  }
}
// ───────────────────────────────────────────────────────────────────────────

interface VendorsContextValue {
  vendors: Vendor[];
  activeVendors: Vendor[];
  loading: boolean;
  error: string | null;
  loadVendors: () => Promise<void>;
  addVendor: (vendorData: Omit<Vendor, 'id'>) => Promise<string>;
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => Promise<void>;
  deactivateVendor: (vendorId: string) => Promise<void>;
  getVendorById: (vendorId: string) => Vendor | undefined;
  getVendorName: (vendorId?: string) => string;
  DEFAULT_VENDOR_ID: string;
}

const VendorsContext = createContext<VendorsContextValue | null>(null);

export const VendorsProvider: React.FC<{ userId?: string; children: ReactNode }> = ({ userId, children }) => {
  const initRef = useRef<{ vendors: Vendor[]; hasCache: boolean } | null>(null);
  if (!initRef.current) {
    const cached = userId ? readVendorCache(userId) : null;
    initRef.current = { vendors: cached ?? [], hasCache: !!cached };
  }

  const [vendors, setVendors] = useState<Vendor[]>(initRef.current.vendors);
  const [loading, setLoading] = useState(!initRef.current.hasCache);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setVendors([]);
      return;
    }

    if (!initRef.current?.hasCache) {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch first — only seed the default vendors the very first time a user has none.
      let vendorsData = await vendorService.getVendors(userId);
      if (vendorsData.length === 0) {
        await vendorService.initializeVendors(userId);
        vendorsData = await vendorService.getVendors(userId);
      }

      writeVendorCache(userId, vendorsData);
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addVendor = useCallback(async (vendorData: Omit<Vendor, 'id'>): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const vendorId = await vendorService.addVendor(userId, vendorData);
      await loadVendors();
      return vendorId;
    } catch (err) {
      console.error('Error adding vendor:', err);
      throw err;
    }
  }, [userId, loadVendors]);

  const updateVendor = useCallback(async (vendorId: string, updates: Partial<Vendor>): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await vendorService.updateVendor(userId, vendorId, updates);
      await loadVendors();
    } catch (err) {
      console.error('Error updating vendor:', err);
      throw err;
    }
  }, [userId, loadVendors]);

  const deactivateVendor = useCallback(async (vendorId: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await vendorService.deactivateVendor(userId, vendorId);
      await loadVendors();
    } catch (err) {
      console.error('Error deactivating vendor:', err);
      throw err;
    }
  }, [userId, loadVendors]);

  const getVendorById = useCallback((vendorId: string): Vendor | undefined => {
    return vendors.find(vendor => vendor.id === vendorId);
  }, [vendors]);

  const getVendorName = useCallback((vendorId?: string): string => {
    if (!vendorId) return 'Unknown Vendor';
    const vendor = getVendorById(vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  }, [getVendorById]);

  const activeVendors = useMemo(() => vendors.filter(vendor => vendor.isActive), [vendors]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const value: VendorsContextValue = {
    vendors,
    activeVendors,
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

  return (
    <VendorsContext.Provider value={value}>
      {children}
    </VendorsContext.Provider>
  );
};

export const useVendors = (): VendorsContextValue => {
  const ctx = useContext(VendorsContext);
  if (!ctx) {
    throw new Error('useVendors must be used within a VendorsProvider');
  }
  return ctx;
};
