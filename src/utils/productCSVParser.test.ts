import { describe, expect, it } from 'vitest';
import { parseProductCSV, validateProductCSV } from './productCSVParser';

const validCSV = `Item,orderPlaced,orderDelivered,reviewAdded,reviewLive,reviewSSSent,paid,received,delta
Sample Product 1,Y,Y,Y,Y,Y,29.99,25.99,-4.00
Sample Product 2,Y,Y,Y,N,N,45.50,45.50,0.00
Sample Product 3,,,,,,19.99,,
, Y,Y,Y,Y,Y,10.00,10.00,0.00
`;

describe('productCSVParser', () => {
  it('validates a well-formed CSV', () => {
    expect(validateProductCSV(validCSV)).toEqual({ isValid: true });
  });

  it('rejects CSV missing Item column', () => {
    const result = validateProductCSV('name,paid\nFoo,10');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Item');
  });

  it('rejects CSV with header only', () => {
    const result = validateProductCSV('Item,paid\n');
    expect(result.isValid).toBe(false);
  });

  it('parses booleans from Y and blank', () => {
    const { products } = parseProductCSV(validCSV);
    expect(products[0].orderPlaced).toBe(true);
    expect(products[0].reviewLive).toBe(true);
    expect(products[1].reviewLive).toBe(false);
    expect(products[2].orderPlaced).toBe(false);
  });

  it('computes delta from paid and received', () => {
    const { products } = parseProductCSV(validCSV);
    expect(products[0].delta).toBeCloseTo(-4);
    expect(products[1].delta).toBeCloseTo(0);
    expect(products[2].delta).toBeNull();
  });

  it('skips rows with blank Item', () => {
    const { products, skipped } = parseProductCSV(validCSV);
    expect(products).toHaveLength(3);
    expect(skipped).toBe(1);
  });

  it('ignores delta column and recalculates', () => {
    const csv = `Item,paid,received,delta
Widget,10,8,999`;
    const { products } = parseProductCSV(csv);
    expect(products[0].delta).toBe(-2);
  });
});
