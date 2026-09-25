import { describe, expect, it } from 'vitest';
import {
  buildImportUrl,
  decodeImportPayload,
  encodeImportPayload,
  isImportUrlTooLong,
} from './importHandoff';
import { BookmarkletPayload, normalizeBookmarkletPayload, parseBookmarkletClipboard } from './bookmarklet';

const samplePayload: BookmarkletPayload = {
  retailer: 'amazon',
  orderDate: 'January 5, 2026',
  orderNumber: '111-4351533-8979462',
  orderTotal: 42.99,
  productName: 'Test Product',
  productUrl: 'https://www.amazon.com/dp/B012345678',
  imageUrl: 'https://m.media-amazon.com/images/I/test.jpg',
  products: [
    {
      productName: 'Test Product',
      productUrl: 'https://www.amazon.com/dp/B012345678',
      imageUrl: 'https://m.media-amazon.com/images/I/test.jpg',
    },
  ],
};

describe('importHandoff', () => {
  it('round-trips payload through base64url encoding', () => {
    const encoded = encodeImportPayload(samplePayload);
    expect(decodeImportPayload(encoded)).toEqual(samplePayload);
  });

  it('builds import URL with hash fragment', () => {
    const url = buildImportUrl('https://app.example.com', samplePayload);
    expect(url.startsWith('https://app.example.com/products#import=')).toBe(true);
    expect(url.includes('?')).toBe(false);
  });

  it('detects oversized URLs', () => {
    expect(isImportUrlTooLong('https://x.com/products#import=' + 'a'.repeat(8000))).toBe(true);
  });
});

describe('bookmarklet parsing', () => {
  it('parses JSON clipboard payload', () => {
    const parsed = parseBookmarkletClipboard(JSON.stringify(samplePayload));
    expect(parsed.orderNumber).toBe(samplePayload.orderNumber);
    expect(parsed.retailer).toBe('amazon');
  });

  it('normalizes multi-product payload to first product fields', () => {
    const normalized = normalizeBookmarkletPayload({
      retailer: 'walmart',
      orderNumber: '1234567-12345678',
      products: [{ productName: 'A', productUrl: 'https://walmart.com/ip/a', imageUrl: '' }],
    });
    expect(normalized.productName).toBe('A');
    expect(normalized.products?.length).toBe(1);
  });

  it('parses Amazon order URL paste', () => {
    const parsed = parseBookmarkletClipboard(
      'https://www.amazon.com/your-orders/order-details?orderID=111-4351533-8979462',
    );
    expect(parsed.orderNumber).toBe('111-4351533-8979462');
    expect(parsed.retailer).toBe('amazon');
  });
});
