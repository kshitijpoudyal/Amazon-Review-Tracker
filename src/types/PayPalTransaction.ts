export interface PayPalTransaction {
  id?: string; // Firebase document ID
  date: string;
  time: string;
  timeZone: string;
  name: string;
  type: string;
  currency: string;
  amount: number;
  fees: number;
  total: number;
  exchangeRate?: string;
  receiptId?: string;
  transactionId: string; // Unique PayPal transaction ID
  itemTitle?: string;
  linkedProductId?: string; // Legacy: Single product link (for backward compatibility)
  linkedProductIds?: string[]; // NEW: Multiple product links
  createdAt?: any; // Firebase timestamp
  updatedAt?: any; // Firebase timestamp
}

export interface PayPalTransactionData {
  transactions: PayPalTransaction[];
  summary: {
    totalIncome: number;
    totalFees: number;
    netReceivedTotal: number;
    transactionCount: number;
  };
}
