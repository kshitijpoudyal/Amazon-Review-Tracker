import { describe, expect, it } from 'vitest';
import {
  buildAmazonBookmarkletHref,
  buildWayfairBookmarkletHref,
  buildWalmartBookmarkletHref,
} from './bookmarklet';

const PROD_ORIGIN = 'https://amazon-review-tracker.vercel.app';

describe('retailer bookmarklets', () => {
  it.each([
    ['amazon', buildAmazonBookmarkletHref],
    ['wayfair', buildWayfairBookmarkletHref],
    ['walmart', buildWalmartBookmarkletHref],
  ])('%s embeds prod app origin and opens a new tab', (_retailer, buildHref) => {
    const href = buildHref(PROD_ORIGIN);
    expect(href.startsWith('javascript:')).toBe(true);
    expect(href).toContain(PROD_ORIGIN);
    expect(href).toContain('/products#import=');
    expect(href).toContain("window.open(url,'_blank'");
  });
});
