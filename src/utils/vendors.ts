import { Vendor } from '../types/Product';

// Default vendors with IDs
export const DEFAULT_VENDORS: Vendor[] = [
  {
    id: 'V001',
    name: 'MD Bro',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V002',
    name: 'Snow Cloud',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

// Default vendor ID for backfilling
export const DEFAULT_VENDOR_ID = 'V001';

// Utility functions for vendor management
export const getVendorById = (vendors: Vendor[], vendorId: string): Vendor | undefined => {
  return vendors.find(vendor => vendor.id === vendorId);
};

export const getVendorName = (vendors: Vendor[], vendorId?: string): string => {
  if (!vendorId) return 'Unknown Vendor';
  const vendor = getVendorById(vendors, vendorId);
  return vendor ? vendor.name : 'Unknown Vendor';
};

export const getActiveVendors = (vendors: Vendor[]): Vendor[] => {
  return vendors.filter(vendor => vendor.isActive);
};