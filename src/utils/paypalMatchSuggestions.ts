import { Product } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';
import { getProductStatusType } from './productStatus';

export interface PayPalMatchSuggestion {
  product: Product;
  score: number;
  amountDiff: number;
  confidence: 'high' | 'medium' | 'low';
}

const ELIGIBLE_STATUSES = new Set(['refund-pending', 'send-screenshot', 'review-pending']);

export function getPayPalMatchSuggestions(
  transaction: PayPalTransaction,
  products: Product[],
  linkedProductIds: string[] = [],
  limit = 3
): PayPalMatchSuggestion[] {
  const linkedSet = new Set(linkedProductIds);
  const targetAmount = transaction.total;

  const candidates = products.filter((p) => {
    if (!p.id || linkedSet.has(p.id)) return false;
    if (p.isVoid) return false;
    const status = getProductStatusType(p);
    if (!ELIGIBLE_STATUSES.has(status) && p.received != null) return false;
    if (p.paid == null) return false;
    return true;
  });

  const scored = candidates.map((product) => {
    const amountDiff = Math.abs((product.paid ?? 0) - targetAmount);
    let score = amountDiff;

    const status = getProductStatusType(product);
    if (status === 'refund-pending') score *= 0.5;
    if (status === 'send-screenshot') score *= 0.7;

    const nameLower = transaction.name.toLowerCase();
    const itemLower = (product.item || '').toLowerCase();
    if (itemLower && nameLower.includes(itemLower.slice(0, 20))) score *= 0.3;

    let confidence: PayPalMatchSuggestion['confidence'] = 'low';
    if (amountDiff < 0.01) confidence = 'high';
    else if (amountDiff <= 5) confidence = 'medium';

    return { product, score, amountDiff, confidence };
  });

  return scored.sort((a, b) => a.score - b.score).slice(0, limit);
}
