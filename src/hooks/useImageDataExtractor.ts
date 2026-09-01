import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

interface ExtractedOrderData {
  orderNumber: string | null;
  orderDate: string | null;
  orderTotal: number | null;
  shippingAddress: {
    name?: string;
    street?: string;
    cityStateZip?: string;
    country?: string;
  };
  items: Array<{
    quantity: number;
    name: string;
    price: number;
  }>;
  paymentInfo: {
    method?: string;
  };
}

interface ImageExtractionResult {
  rawText: string;
  orderData?: ExtractedOrderData;
  generalData?: Record<string, any>;
  error?: string;
}

// Lines to always exclude when searching for product name
const EXCLUDE_LINE_PATTERNS = [
  /order placed/i,
  /order\s*#/i,
  /ship to/i,
  /payment method/i,
  /sold by/i,
  /supplied by/i,
  /arriving/i,
  /track package/i,
  /cancel items/i,
  /view invoice/i,
  /change shipping/i,
  /change payment/i,
  /buy it again/i,
  /ask product/i,
  /write a product/i,
  /subtotal/i,
  /shipping\s*&/i,
  /grand total/i,
  /estimated tax/i,
  /total before tax/i,
  /item\(s\)/i,
  /view related/i,
  /earns \d/i,
  /^\$/,
  /^[\d.,]+$/,
  /united states/i,
  /\d{5}/,             // zip codes
];

const isExcluded = (line: string) =>
  EXCLUDE_LINE_PATTERNS.some(p => p.test(line.trim()));

/**
 * Extract "Order placed Month Day, Year"
 */
const extractOrderDate = (text: string): string | null => {
  // Stop at | to avoid bleeding into the order number part
  const lineMatch = text.match(/Order placed\s+([^\n|]+)/i);
  if (!lineMatch) return null;
  const segment = lineMatch[1].trim();
  const match = segment.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
  if (!match) return null;
  // Return in standard "Month DD, YYYY" form to ensure reliable parsing downstream
  return `${match[1]} ${match[2]}, ${match[3]}`;
};

/**
 * Extract Amazon order number — strict format: 3-7-7 digits with dashes
 * e.g. 111-5728421-1193011
 */
const extractOrderNumber = (text: string): string | null => {
  const match = text.match(/\b(\d{3}-\d{7}-\d{7})\b/);
  return match ? match[1] : null;
};

/**
 * Extract Grand Total amount
 */
const extractGrandTotal = (text: string): number | null => {
  const match = text.match(/Grand Total[:\s]+\$?([\d,]+\.\d{2})/i);
  if (!match) return null;
  const val = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(val) ? null : val;
};

/**
 * Extract product name using 3 strategies in priority order:
 * 1. Text captured between "Arriving [weekday]" and "Sold by:" / price
 * 2. The line immediately before "Sold by:"
 * 3. Longest descriptive non-excluded line in the document
 */
const extractProductName = (text: string, lines: string[]): string | null => {
  // Strategy 1: Between "Arriving [day]" section and "Sold by:"
  const arrivingToSoldBy = text.match(
    /Arriving\s+\w+[\s\S]*?\n([\s\S]+?)(?=\nSold by:|\nBuy it again|\n\$\d)/i
  );
  if (arrivingToSoldBy) {
    const candidate = arrivingToSoldBy[1]
      .split('\n')
      .map(l => l.trim())
      .find(l => l.length > 15 && !isExcluded(l) && l.split(' ').length >= 3);
    if (candidate) return candidate;
  }

  // Strategy 2: Line immediately before "Sold by:"
  const soldByIdx = lines.findIndex(l => /^Sold by:/i.test(l.trim()));
  if (soldByIdx > 1) {
    for (let i = soldByIdx - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.length > 15 && !isExcluded(line) && line.split(' ').length >= 3) {
        return line;
      }
    }
  }

  // Strategy 3: Longest descriptive line in the whole document
  const candidates = lines
    .map(l => l.trim())
    .filter(l => l.length > 20 && l.split(' ').length >= 4 && !isExcluded(l));

  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] || null;
};

/**
 * Extract Walmart order number — format: 7 digits - 8 digits
 * e.g. 2000137-32104888
 */
const extractWalmartOrderNumber = (text: string): string | null => {
  const match = text.match(/\b(\d{7}-\d{8})\b/);
  return match ? match[1] : null;
};

/**
 * Extract Walmart order date from header like "Nov 07, 2025 order"
 */
const extractWalmartOrderDate = (text: string): string | null => {
  const match = text.match(/([A-Za-z]+\s+\d{1,2}),?\s*(\d{4})\s+order/i);
  if (!match) return null;
  return `${match[1]}, ${match[2]}`;
};

/**
 * Extract Walmart order total — standalone "Total" line (not Subtotal)
 */
const extractWalmartTotal = (text: string): number | null => {
  const matches = [...text.matchAll(/(?:^|\n)\s*Total\s*\$?\s*([\d,]+\.\d{2})/gim)];
  if (!matches.length) return null;
  const val = parseFloat(matches[matches.length - 1][1].replace(/,/g, ''));
  return isNaN(val) ? null : val;
};

const WALMART_EXCLUDE_LINE_PATTERNS = [
  ...EXCLUDE_LINE_PATTERNS,
  /sold by/i,
  /fulfilled by/i,
  /delivered on/i,
  /charge history/i,
  /ending in/i,
  /savings/i,
  /walmart\+/i,
  /no \$35 order minimum/i,
  /how can we help/i,
  /purchase history/i,
  /order details/i,
  /^\d+\s+item/i,
];

const isWalmartExcluded = (line: string) =>
  WALMART_EXCLUDE_LINE_PATTERNS.some(p => p.test(line.trim()));

const looksLikeWalmartOrder = (text: string): boolean =>
  /\b\d{7}-\d{8}\b/.test(text) &&
  (/walmart/i.test(text) || /Order\s*#/i.test(text) || /\sorder\s*\|/i.test(text));

/**
 * Extract product name from Walmart order OCR text
 */
const extractWalmartProductName = (lines: string[]): string | null => {
  const candidates = lines
    .map(l => l.trim())
    .filter(l => l.length > 15 && l.split(' ').length >= 3 && !isWalmartExcluded(l));

  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] || null;
};

/**
 * Main Walmart order parser
 */
const parseWalmartOrder = (text: string): ExtractedOrderData => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const orderDate = extractWalmartOrderDate(text);
  const orderNumber = extractWalmartOrderNumber(text);
  const orderTotal = extractWalmartTotal(text);
  const productName = extractWalmartProductName(lines);

  return {
    orderNumber,
    orderDate,
    orderTotal,
    shippingAddress: {},
    items: productName
      ? [{ quantity: 1, name: productName, price: orderTotal ?? 0 }]
      : [],
    paymentInfo: {}
  };
};

const parseOrderFromText = (text: string): ExtractedOrderData =>
  looksLikeWalmartOrder(text) ? parseWalmartOrder(text) : parseAmazonOrder(text);

/**
 * Main Amazon order parser — clean and focused
 */
const parseAmazonOrder = (text: string): ExtractedOrderData => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const cleanText = text.replace(/\s+/g, ' ');

  const orderDate = extractOrderDate(cleanText);
  const orderNumber = extractOrderNumber(cleanText);
  const orderTotal = extractGrandTotal(cleanText);
  const productName = extractProductName(text, lines);

  console.log('📅 Date:', orderDate);
  console.log('🔢 Order #:', orderNumber);
  console.log('💰 Total:', orderTotal);
  console.log('📦 Product:', productName);

  return {
    orderNumber,
    orderDate,
    orderTotal,
    shippingAddress: {},
    items: productName
      ? [{ quantity: 1, name: productName, price: orderTotal ?? 0 }]
      : [],
    paymentInfo: {}
  };
};

export const useImageDataExtractor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const runOcr = useCallback(async (source: File | string): Promise<string> => {
    const worker = await createWorker('eng');
    try {
      const input = typeof source === 'string' ? source : URL.createObjectURL(source);
      const { data: { text } } = await worker.recognize(input);
      if (typeof source !== 'string') URL.revokeObjectURL(input);
      return text;
    } finally {
      await worker.terminate();
    }
  }, []);

  const extractDataFromImage = useCallback(async (
    file: File,
    type: 'amazon-order' | 'general' = 'general'
  ): Promise<ImageExtractionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const text = await runOcr(file);
      setDebugInfo(text);
      const result: ImageExtractionResult = { rawText: text };
      if (type === 'amazon-order') {
        result.orderData = parseOrderFromText(text);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return { rawText: '', error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [runOcr]);

  const extractFromImageUrl = useCallback(async (
    imageUrl: string,
    type: 'amazon-order' | 'general' = 'general'
  ): Promise<ImageExtractionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const text = await runOcr(imageUrl);
      setDebugInfo(text);
      const result: ImageExtractionResult = { rawText: text };
      if (type === 'amazon-order') {
        result.orderData = parseOrderFromText(text);
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return { rawText: '', error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [runOcr]);

  return {
    extractDataFromImage,
    extractFromImageUrl,
    isLoading,
    error,
    debugInfo
  };
};
