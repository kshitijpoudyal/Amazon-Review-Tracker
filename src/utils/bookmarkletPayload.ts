export interface BookmarkletProduct {
  productName: string;
  productUrl: string;
  imageUrl: string;
  quantity?: number;
  price?: number | null;
}

export interface BookmarkletPayload {
  retailer?: 'amazon' | 'wayfair' | 'walmart';
  orderDate: string;
  orderNumber: string;
  orderTotal: number | null;
  productName: string;
  productUrl: string;
  imageUrl: string;
  products?: BookmarkletProduct[];
}

function inferRetailer(payload: Partial<BookmarkletPayload>): BookmarkletPayload['retailer'] {
  if (payload.retailer) return payload.retailer;
  const url = payload.productUrl || payload.products?.[0]?.productUrl || '';
  if (/amazon\.com/i.test(url)) return 'amazon';
  if (/wayfair\.com/i.test(url)) return 'wayfair';
  if (/walmart\.com/i.test(url)) return 'walmart';
  const orderNumber = payload.orderNumber || '';
  if (/^\d{3}-\d{7}-\d{7}$/.test(orderNumber)) return 'amazon';
  if (/^\d{7}-\d{8}$/.test(orderNumber)) return 'walmart';
  if (/^\d{10,}$/.test(orderNumber)) return 'wayfair';
  return undefined;
}

export function normalizeBookmarkletPayload(raw: unknown): BookmarkletPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Not an object');
  }
  const parsed = raw as Partial<BookmarkletPayload>;
  const products = Array.isArray(parsed.products) ? parsed.products : undefined;
  const first = products?.[0];
  const payload: BookmarkletPayload = {
    retailer: inferRetailer(parsed),
    orderDate: parsed.orderDate ?? '',
    orderNumber: parsed.orderNumber ?? '',
    orderTotal: parsed.orderTotal ?? null,
    productName: parsed.productName ?? first?.productName ?? '',
    productUrl: parsed.productUrl ?? first?.productUrl ?? '',
    imageUrl: parsed.imageUrl ?? first?.imageUrl ?? '',
    ...(products?.length ? { products } : {}),
  };
  const retailer = inferRetailer(payload);
  return retailer ? { ...payload, retailer } : payload;
}

export function bookmarkletPayloadToProductFields(
  data: BookmarkletPayload,
  productIndex = 0,
): Pick<BookmarkletPayload, 'productName' | 'productUrl' | 'imageUrl'> & {
  orderDate: string;
  orderNumber: string;
  orderTotal: number | null;
  retailer?: BookmarkletPayload['retailer'];
} {
  const item = data.products?.[productIndex];
  return {
    orderDate: data.orderDate,
    orderNumber: data.orderNumber,
    orderTotal: data.orderTotal,
    retailer: data.retailer,
    productName: item?.productName || data.productName,
    productUrl: item?.productUrl || data.productUrl,
    imageUrl: item?.imageUrl || data.imageUrl,
  };
}
