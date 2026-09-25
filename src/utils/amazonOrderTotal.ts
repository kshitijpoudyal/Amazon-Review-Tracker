/** Patterns for Amazon order-details total (desktop + mobile copy variants). */
export const AMAZON_ORDER_TOTAL_PATTERNS = [
  /Grand Total[:\s]*\$?\s*([\d,]+\.\d{2})/i,
  /Order total[:\s]*\$?\s*([\d,]+\.\d{2})/i,
  /Order Total[:\s]*\$?\s*([\d,]+\.\d{2})/i,
];

export function parseAmazonOrderTotalFromText(text: string): number | null {
  for (const pattern of AMAZON_ORDER_TOTAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      if (!Number.isNaN(value)) return value;
    }
  }
  return null;
}
