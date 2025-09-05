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
  statusLastChanged?: string; // ISO string timestamp of last status change
  lastNotificationSent?: string; // ISO string timestamp of last notification sent
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
