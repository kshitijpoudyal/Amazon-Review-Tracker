import { describe, expect, it } from 'vitest';
import { parseAmazonOrderTotalFromText } from './amazonOrderTotal';

describe('parseAmazonOrderTotalFromText', () => {
  it('parses Grand Total from desktop order summary', () => {
    const text = 'Subtotal $39.99\nShipping $0.00\nGrand Total: $42.99';
    expect(parseAmazonOrderTotalFromText(text)).toBe(42.99);
  });

  it('parses Order total variant (mobile)', () => {
    const text = 'Payment method\nOrder total\n$19.50';
    expect(parseAmazonOrderTotalFromText(text)).toBe(19.5);
  });

  it('returns null when no total label found', () => {
    expect(parseAmazonOrderTotalFromText('Subtotal $10.00')).toBeNull();
  });
});
