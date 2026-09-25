import { describe, expect, it } from 'vitest';
import { isAmazonImagePlaceholder, parseAmazonImageUrl } from './amazonProductImage';

describe('isAmazonImagePlaceholder', () => {
  it('flags transparent gif placeholders', () => {
    expect(isAmazonImagePlaceholder('https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/transparent-pixel._V192234675_.gif')).toBe(true);
  });

  it('accepts real product images', () => {
    expect(isAmazonImagePlaceholder('https://m.media-amazon.com/images/I/71abc._AC_SL1500_.jpg')).toBe(false);
  });
});

describe('parseAmazonImageUrl', () => {
  it('prefers data-a-hires over lazy src', () => {
    expect(parseAmazonImageUrl({
      dataAHires: 'https://m.media-amazon.com/images/I/71abc._AC_SL1500_.jpg',
      src: 'https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/transparent-pixel.gif',
    })).toBe('https://m.media-amazon.com/images/I/71abc._AC_SL1500_.jpg');
  });

  it('parses data-a-dynamic-image JSON', () => {
    expect(parseAmazonImageUrl({
      dataADynamicImage: '{"https://m.media-amazon.com/images/I/small.jpg":[50,50],"https://m.media-amazon.com/images/I/large.jpg":[500,500]}',
    })).toBe('https://m.media-amazon.com/images/I/large.jpg');
  });

  it('falls back to data-src when src is a placeholder', () => {
    expect(parseAmazonImageUrl({
      dataSrc: 'https://m.media-amazon.com/images/I/71abc._AC_SL1500_.jpg',
      src: 'https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/transparent-pixel.gif',
    })).toBe('https://m.media-amazon.com/images/I/71abc._AC_SL1500_.jpg');
  });

  it('uses srcset largest candidate', () => {
    expect(parseAmazonImageUrl({
      srcset: 'https://m.media-amazon.com/images/I/small.jpg 1x, https://m.media-amazon.com/images/I/large.jpg 2x',
    })).toBe('https://m.media-amazon.com/images/I/large.jpg');
  });
});
