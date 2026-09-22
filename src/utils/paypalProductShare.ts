import { PayPalTransaction } from '../types/PayPalTransaction';

type ShareTransaction = Pick<
  PayPalTransaction,
  'total' | 'linkedProductIds' | 'splitPrice' | 'productSplitAmounts'
>;

export function getPayPalProductShare(transaction: ShareTransaction, productId: string): number {
  const linkedIds = transaction.linkedProductIds || [];
  const custom = transaction.productSplitAmounts?.[productId];
  if (custom != null && !Number.isNaN(custom)) {
    return custom;
  }
  if (transaction.splitPrice && linkedIds.length > 1) {
    return transaction.total / linkedIds.length;
  }
  return transaction.total;
}
