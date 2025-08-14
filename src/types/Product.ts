export interface Product {
  id?: string; // Firebase document ID
  item: string;
  url?: string; // Product URL
  orderDate: string | null;
  orderPlaced: boolean;
  orderDelivered: boolean;
  reviewAdded: boolean;
  reviewLive: boolean;
  reviewSSSent: boolean;
  paid: number | null;
  received: number | null;
  delta: number | null;
  isVoid?: boolean;
}

export interface ProductData {
  products: Product[];
  summary: {
    totalPaid: number;
    totalReceived: number;
    netDelta: number;
  };
}

export type StatusFilter = '' | 'new' | 'review-not-added' | 'review-pending' | 'pending-refund' | 'complete' | 'void';
export type DeltaFilter = '' | 'positive' | 'negative' | 'zero';
