import { Product } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';
import { getProductStatusType } from './productStatus';
import { getAmountDiffFromBand, getRefundConfidence } from './refundUtils';

export interface PayPalMatchSuggestion {
  product: Product;
  score: number;
  amountDiff: number;
  confidence: 'high' | 'medium' | 'low';
}

const ELIGIBLE_STATUSES = new Set(['refund-pending', 'send-screenshot', 'review-pending']);

const ROUND_SHORTFALLS = [10, 20];

function isRoundSellerShortfall(paid: number, targetAmount: number): boolean {
  const shortfall = paid - targetAmount;
  return ROUND_SHORTFALLS.some((s) => Math.abs(shortfall - s) < 0.02);
}

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
    const paid = product.paid ?? 0;
    const amountDiff = getAmountDiffFromBand(paid, targetAmount, product.tax);
    let score = amountDiff;

    const status = getProductStatusType(product);
    if (status === 'refund-pending') score *= 0.5;
    if (status === 'send-screenshot') score *= 0.7;

    if (isRoundSellerShortfall(paid, targetAmount)) score *= 0.6;

    const nameLower = transaction.name.toLowerCase();
    const itemLower = (product.item || '').toLowerCase();
    if (itemLower && nameLower.includes(itemLower.slice(0, 20))) score *= 0.3;

    const confidence = getRefundConfidence(paid, targetAmount, product.tax);

    return { product, score, amountDiff, confidence };
  });

  return scored.sort((a, b) => a.score - b.score).slice(0, limit);
}
