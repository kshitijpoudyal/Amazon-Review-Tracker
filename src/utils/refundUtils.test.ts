import { describe, expect, it } from 'vitest';
import {
  getDefaultPayPalFee,
  getExpectedReceived,
  getProductRefundExpectation,
  getProductTax,
  getRefundExpectationSummary,
  getRefundVariance,
  hasRefundExpectation,
  normalizeRefundExpectation,
  resolveExcludedTaxAmount,
} from './refundUtils';
import { DEFAULT_REFUND_EXPECTATION, Product } from '../types/Product';

describe('refundUtils', () => {
  it('computes default PayPal fee at 4.5%', () => {
    expect(getDefaultPayPalFee(100)).toBe(4.5);
    expect(getDefaultPayPalFee(null)).toBeNull();
  });

  it('normalizes legacy tax and notes into refundExpectation', () => {
    const result = normalizeRefundExpectation(null, 8.25, 'vendor keeps tax');
    expect(result.excludeTax).toBe(true);
    expect(result.taxAmount).toBe(8.25);
    expect(result.notes).toBe('vendor keeps tax');
  });

  it('computes expected received with combined deductions', () => {
    const expectation = normalizeRefundExpectation({
      excludeTax: true,
      taxAmount: 5,
      customDeduction: 10,
      excludePayPalFee: true,
      paypalFeeAmount: 4.5,
    });
    expect(getExpectedReceived(100, expectation)).toBe(80.5);
  });

  it('returns full refund summary when no deductions', () => {
    const expectation = normalizeRefundExpectation({});
    expect(hasRefundExpectation(expectation)).toBe(false);
    expect(getRefundExpectationSummary(expectation, 50)).toBe('Full refund');
  });

  it('builds summary label for partial expectations', () => {
    const expectation = normalizeRefundExpectation({
      excludeTax: true,
      taxAmount: 3.5,
      customDeduction: 10,
    });
    expect(getRefundExpectationSummary(expectation, 100)).toContain('Tax excluded');
    expect(getRefundExpectationSummary(expectation, 100)).toContain('$10.00 less');
  });

  it('reads product refund expectation with legacy fields', () => {
    const product = {
      tax: 6,
      refundNotes: 'no fee back',
    } as Product;
    const expectation = getProductRefundExpectation(product);
    expect(expectation.excludeTax).toBe(true);
    expect(expectation.taxAmount).toBe(6);
    expect(expectation.notes).toBe('no fee back');
  });

  it('keeps saved order tax separate until exclusion is enabled', () => {
    const product = {
      tax: 8.25,
      refundExpectation: { ...DEFAULT_REFUND_EXPECTATION },
    } as Product;
    const expectation = getProductRefundExpectation(product);
    expect(expectation.excludeTax).toBe(false);
    expect(getProductTax(product)).toBe(8.25);
    expect(resolveExcludedTaxAmount(expectation, getProductTax(product))).toBe(8.25);
  });

  it('prefers an explicit excluded tax amount over saved order tax', () => {
    const expectation = normalizeRefundExpectation({
      excludeTax: true,
      taxAmount: 4,
    });
    expect(resolveExcludedTaxAmount(expectation, 8.25)).toBe(4);
  });

  it('classifies variance against expected received', () => {
    expect(getRefundVariance(90, 90).label).toBe('Matches expected');
    expect(getRefundVariance(90, 87.5).label).toBe('$2.50 short of expected');
    expect(getRefundVariance(90, 92).label).toBe('$2.00 over expected');
  });
});
