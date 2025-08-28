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
  linkedProductId?: string; // NEW: Link to Product ID for mapping
  createdAt?: any; // Firebase timestamp
  updatedAt?: any; // Firebase timestamp
}

export interface PayPalTransactionData {
  transactions: PayPalTransaction[];
  summary: {
    totalIncome: number;
    totalFees: number;
    netIncome: number;
    transactionCount: number;
  };
}
