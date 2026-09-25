/** Return true when src looks like a lazy-load placeholder, not a product image. */
export function isAmazonImagePlaceholder(src: string): boolean {
  return /\.gif(\?|$)/i.test(src) || /transparent|spacer|pixel|data:image/i.test(src);
}

/** Extract the best product image URL from img element attributes. */
export function parseAmazonImageUrl(attrs: {
  src?: string | null;
  dataAHires?: string | null;
  dataADynamicImage?: string | null;
  dataSrc?: string | null;
  dataOldHires?: string | null;
  srcset?: string | null;
}): string {
  const { dataAHires, dataADynamicImage, dataSrc, dataOldHires, srcset, src } = attrs;

  if (dataAHires?.startsWith('http')) return dataAHires;

  if (dataADynamicImage) {
    try {
      const parsed = JSON.parse(dataADynamicImage) as Record<string, unknown>;
      const urls = Object.keys(parsed).filter((u) => u.startsWith('http'));
      if (urls.length) return urls[urls.length - 1];
    } catch {
      // ignore malformed JSON
    }
  }

  for (const candidate of [dataSrc, dataOldHires, src]) {
    if (candidate?.startsWith('http') && !isAmazonImagePlaceholder(candidate)) return candidate;
  }

  if (srcset) {
    const parts = srcset.split(',').map((p) => p.trim().split(/\s+/)[0]).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return '';
}
