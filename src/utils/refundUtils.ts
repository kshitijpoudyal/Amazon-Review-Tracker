/**
 * Refund band and shortfall helpers for partial PayPal refunds
 * (tax, fees, seller-defined $10–$20 shortfalls).
 */

import {
  DEFAULT_REFUND_EXPECTATION,
  Product,
  RefundExpectation,
} from '../types/Product';

export interface RefundBand {
  low: number;
  high: number;
}

const PAYPAL_FEE_RATE = 0.045;
const MATCH_TOLERANCE = 0.02;

/** Default PayPal fee estimate (4.5% of paid). */
export function getDefaultPayPalFee(paid: number | null | undefined): number | null {
  if (paid == null || paid <= 0) return null;
  return Math.round(paid * PAYPAL_FEE_RATE * 100) / 100;
}

export function normalizeRefundExpectation(
  raw?: Partial<RefundExpectation> | null,
  legacyTax?: number | null,
  legacyNotes?: string
): RefundExpectation {
  const base = { ...DEFAULT_REFUND_EXPECTATION, ...raw };
  const hasLegacyTax = legacyTax != null && legacyTax > 0;

  return {
    excludeTax: base.excludeTax || hasLegacyTax,
    taxAmount: base.taxAmount ?? (hasLegacyTax ? legacyTax : null),
    customDeduction: base.customDeduction ?? null,
    excludePayPalFee: base.excludePayPalFee ?? false,
    paypalFeeAmount: base.paypalFeeAmount ?? null,
    notes: base.notes?.trim() || legacyNotes?.trim() || '',
  };
}

export function getProductTax(product: Product): number | null {
  const tax = product.tax;
  if (tax == null || tax <= 0) return null;
  return tax;
}

/** Tax to deduct when exclusion is enabled; prefers an explicit amount, then saved order tax. */
export function resolveExcludedTaxAmount(
  expectation: RefundExpectation,
  productTax: number | null
): number | null {
  if (expectation.taxAmount != null && expectation.taxAmount > 0) {
    return expectation.taxAmount;
  }
  return productTax;
}

export function getProductRefundExpectation(product: Product): RefundExpectation {
  if (product.refundExpectation != null) {
    return normalizeRefundExpectation(product.refundExpectation, null, product.refundNotes);
  }
  // Legacy products stored exclusion on `tax` before refundExpectation existed.
  return normalizeRefundExpectation(null, product.tax, product.refundNotes);
}

export function hasRefundExpectation(expectation: RefundExpectation): boolean {
  return (
    expectation.excludeTax ||
    (expectation.customDeduction != null && expectation.customDeduction > 0) ||
    expectation.excludePayPalFee
  );
}

/** Expected net refund after configured deductions. */
export function getExpectedReceived(
  paid: number | null | undefined,
  expectation: RefundExpectation
): number | null {
  if (paid == null) return null;

  let expected = paid;
  if (expectation.excludeTax && expectation.taxAmount != null && expectation.taxAmount > 0) {
    expected -= expectation.taxAmount;
  }
  if (expectation.customDeduction != null && expectation.customDeduction > 0) {
    expected -= expectation.customDeduction;
  }
  if (
    expectation.excludePayPalFee &&
    expectation.paypalFeeAmount != null &&
    expectation.paypalFeeAmount > 0
  ) {
    expected -= expectation.paypalFeeAmount;
  }

  return Math.max(0, Math.round(expected * 100) / 100);
}

export function getExpectedReceivedForProduct(product: Product): number | null {
  return getExpectedReceived(product.paid, getProductRefundExpectation(product));
}

export function getRefundExpectationSummary(
  expectation: RefundExpectation,
  paid: number | null | undefined
): string {
  if (!hasRefundExpectation(expectation)) {
    return 'Full refund';
  }

  const parts: string[] = [];
  if (expectation.excludeTax) {
    parts.push(
      expectation.taxAmount != null && expectation.taxAmount > 0
        ? `Tax excluded ($${expectation.taxAmount.toFixed(2)})`
        : 'Tax excluded'
    );
  }
  if (expectation.customDeduction != null && expectation.customDeduction > 0) {
    parts.push(`$${expectation.customDeduction.toFixed(2)} less`);
  }
  if (expectation.excludePayPalFee) {
    parts.push(
      expectation.paypalFeeAmount != null && expectation.paypalFeeAmount > 0
        ? `PayPal fee excluded ($${expectation.paypalFeeAmount.toFixed(2)})`
        : 'PayPal fee excluded'
    );
  }

  const expected = getExpectedReceived(paid, expectation);
  if (expected != null && paid != null && expected < paid - 0.01) {
    return parts.join(' · ');
  }

  return parts.join(' · ') || 'Full refund';
}

export function getRefundVariance(
  expected: number,
  received: number
): { variance: number; label: string } {
  const variance = Math.round((received - expected) * 100) / 100;
  if (Math.abs(variance) < 0.01) {
    return { variance: 0, label: 'Matches expected' };
  }
  if (variance < 0) {
    return {
      variance,
      label: `$${Math.abs(variance).toFixed(2)} short of expected`,
    };
  }
  return {
    variance,
    label: `$${variance.toFixed(2)} over expected`,
  };
}

/** Expected refund range: explicit expectation or heuristic band from paid/tax. */
export function getRefundBand(
  paid: number,
  tax?: number | null,
  expectedReceived?: number | null
): RefundBand {
  if (expectedReceived != null && expectedReceived >= 0) {
    return {
      low: Math.max(0, expectedReceived - MATCH_TOLERANCE),
      high: expectedReceived + MATCH_TOLERANCE,
    };
  }

  const taxAmount = tax ?? 0;
  const low = Math.max(0, Math.min(paid - taxAmount, paid * 0.75, paid - 25));
  return { low, high: paid };
}

/** Distance from refund band; 0 if target is inside the band. */
export function getAmountDiffFromBand(
  paid: number,
  targetAmount: number,
  tax?: number | null,
  expectedReceived?: number | null
): number {
  const { low, high } = getRefundBand(paid, tax, expectedReceived);
  if (targetAmount >= low && targetAmount <= high) return 0;
  if (targetAmount < low) return low - targetAmount;
  return targetAmount - high;
}

export function isWithinRefundBand(
  paid: number,
  targetAmount: number,
  tax?: number | null,
  expectedReceived?: number | null
): boolean {
  return getAmountDiffFromBand(paid, targetAmount, tax, expectedReceived) < 0.01;
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
  tax?: number | null,
  expectedReceived?: number | null
): 'high' | 'medium' | 'low' {
  const diff = getAmountDiffFromBand(paid, targetAmount, tax, expectedReceived);
  if (diff < 0.01) return 'high';
  if (diff <= 5) return 'medium';
  return 'low';
}
