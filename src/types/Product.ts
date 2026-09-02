export type Retailer = 'amazon' | 'walmart' | 'wayfair';

export interface Vendor {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

export interface Product {
  id?: string; // Firebase document ID
  item: string;
  url?: string; // Product URL
  imageUrl?: string; // Product image URL
  orderDate: string | null;
  orderNumber?: string; // Order number (not displayed in UI but searchable)
  retailer?: Retailer;
  orderPlaced: boolean;
  orderDelivered: boolean;
  reviewAdded: boolean;
  reviewLive: boolean;
  reviewSSSent: boolean;
  paid: number | null;
  received: number | null;
  delta: number | null;
  tax?: number | null;
  refundNotes?: string;
  paypalTransactionIds?: string[];
  refundReceivedAt?: string; // ISO date when PayPal refund was linked
  isVoid?: boolean;
  vendorId?: string; // Reference to vendor ID
  lastStatus?: string; // Last computed status — used to detect transitions
  statusChangedAt?: string; // ISO date of last status change
}

export interface ProductLinkOptions {
  completeWorkflow?: boolean;
  splitPrice?: boolean;
}

export interface ProductData {
  products: Product[];
  summary: {
    totalPaid: number;
    totalReceived: number;
    netDelta: number;
  };
}

export type StatusFilter = '' | 'order-placed' | 'add-review' | 'review-pending' | 'send-screenshot' |'refund-pending' | 'complete' | 'void';
export type DeltaFilter = '' | 'positive' | 'negative' | 'zero';
export type VendorFilter = '' | string; // Empty string for all vendors, or specific vendor ID
