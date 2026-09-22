import { Product } from '../../types/Product';
import { parseBookmarkletClipboard } from '../../utils/bookmarklet';
import { importButtonBaseClass } from './productFormStyles';

export type ImportStatus = 'idle' | 'success' | 'url-only' | 'error';

export function formatDateForInput(dateString: string): string {
  try {
    const MONTHS: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12',
    };
    const match = dateString.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
    if (match) {
      const month = MONTHS[match[1].toLowerCase()];
      if (month) return `${match[3]}-${month}-${match[2].padStart(2, '0')}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

export function getImportButtonClassName(status: ImportStatus): string {
  if (status === 'success') return `${importButtonBaseClass} bg-[#006a68]/10 text-[#006a68]`;
  if (status === 'url-only') return `${importButtonBaseClass} bg-amber-50 text-amber-700`;
  if (status === 'error') return `${importButtonBaseClass} bg-[#ffdad6] text-[#ba1a1a]`;
  return `${importButtonBaseClass} bg-[#eae8e2] text-[#43474e] hover:bg-[#e4e2dd]`;
}

export function applyBookmarkletPayload(
  prev: Product,
  data: ReturnType<typeof parseBookmarkletClipboard>,
): Product {
  return {
    ...prev,
    item: data.productName || prev.item,
    url: data.productUrl || prev.url,
    imageUrl: data.imageUrl || prev.imageUrl,
    orderNumber: data.orderNumber || prev.orderNumber,
    paid: data.orderTotal ?? prev.paid,
    orderDate: data.orderDate ? formatDateForInput(data.orderDate) : prev.orderDate,
    ...(data.retailer ?? prev.retailer ? { retailer: data.retailer ?? prev.retailer } : {}),
  };
}

export function getClipboardImportLabel(status: ImportStatus): { icon: string; text: string } {
  if (status === 'success') return { icon: '✅', text: 'All fields filled!' };
  if (status === 'url-only') return { icon: '🔢', text: 'Order # filled — add other fields manually' };
  if (status === 'error') return { icon: '⚠️', text: 'Nothing found — copy an Amazon, Wayfair, or Walmart order first' };
  return { icon: '📋', text: 'Import from Clipboard' };
}

export function updateProductNumbers(
  product: Product,
  field: 'paid' | 'received',
  value: string,
): Product {
  const numValue = value === '' ? null : parseFloat(value);
  const updated = { ...product, [field]: numValue };
  if (updated.paid !== null && updated.received !== null) {
    updated.delta = updated.received - updated.paid;
  } else if (updated.paid !== null && updated.received === null) {
    updated.delta = -updated.paid;
  } else if (updated.paid === null && updated.received !== null) {
    updated.delta = updated.received;
  } else {
    updated.delta = null;
  }
  return updated;
}
