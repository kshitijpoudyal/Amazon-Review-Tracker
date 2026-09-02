/**
 * Refund band and shortfall helpers for partial PayPal refunds
 * (tax, fees, seller-defined $10–$20 shortfalls).
 */

export interface RefundBand {
  low: number;
  high: number;
}

/** Expected refund range: roughly paid minus tax/fees/seller shortfall, never above paid. */
export function getRefundBand(paid: number, tax?: number | null): RefundBand {
  const taxAmount = tax ?? 0;
  const low = Math.max(0, Math.min(paid - taxAmount, paid * 0.75, paid - 25));
  return { low, high: paid };
}

/** Distance from refund band; 0 if target is inside the band. */
export function getAmountDiffFromBand(
  paid: number,
  targetAmount: number,
  tax?: number | null
): number {
  const { low, high } = getRefundBand(paid, tax);
  if (targetAmount >= low && targetAmount <= high) return 0;
  if (targetAmount < low) return low - targetAmount;
  return targetAmount - high;
}

export function isWithinRefundBand(
  paid: number,
  targetAmount: number,
  tax?: number | null
): boolean {
  return getAmountDiffFromBand(paid, targetAmount, tax) < 0.01;
}

export type ShortfallReason = 'none' | 'likely_tax_fees' | 'seller_partial' | 'large_shortfall';

export function getShortfall(paid: number, refund: number): number {
  return Math.max(0, paid - refund);
}

export function classifyShortfall(paid: number, refund: number): {
  shortfall: number;
  reason: ShortfallReason;
  label: string;
} {
  const shortfall = getShortfall(paid, refund);
  if (shortfall < 0.01) {
    return { shortfall: 0, reason: 'none', label: 'Full refund' };
  }
  if (shortfall <= 8) {
    return { shortfall, reason: 'likely_tax_fees', label: 'Likely tax/fees' };
  }
  const rounded = Math.round(shortfall);
  if (rounded === 10 || rounded === 20 || (shortfall >= 8 && shortfall <= 22)) {
    return { shortfall, reason: 'seller_partial', label: 'Seller partial refund' };
  }
  return { shortfall, reason: 'large_shortfall', label: 'Partial refund' };
}

export function getRefundConfidence(
  paid: number,
  targetAmount: number,
  tax?: number | null
): 'high' | 'medium' | 'low' {
  const diff = getAmountDiffFromBand(paid, targetAmount, tax);
  if (diff < 0.01) return 'high';
  if (diff <= 5) return 'medium';
  return 'low';
}
