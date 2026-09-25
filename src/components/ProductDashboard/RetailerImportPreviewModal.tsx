import React, { useMemo, useState } from 'react';
import { Modal } from '../common';
import { typography } from '../../utils/typography';
import { colors } from '../../utils/colors';
import { BookmarkletPayload } from '../../utils/bookmarklet';
import { formatCurrency } from '../../utils/currency';
import { formFooterCancelClass, formFooterPrimaryClass } from './productFormStyles';

const RETAILER_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  wayfair: 'Wayfair',
  walmart: 'Walmart',
};

interface RetailerImportPreviewModalProps {
  isOpen: boolean;
  payload: BookmarkletPayload | null;
  onConfirm: (payload: BookmarkletPayload, productIndex: number) => void;
  onDismiss: () => void;
}

export const RetailerImportPreviewModal: React.FC<RetailerImportPreviewModalProps> = ({
  isOpen,
  payload,
  onConfirm,
  onDismiss,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const products = useMemo(() => {
    if (!payload) return [];
    if (payload.products?.length) return payload.products;
    if (payload.productName || payload.productUrl) {
      return [{
        productName: payload.productName,
        productUrl: payload.productUrl,
        imageUrl: payload.imageUrl,
      }];
    }
    return [];
  }, [payload]);

  if (!payload) return null;

  const retailerLabel = payload.retailer ? RETAILER_LABELS[payload.retailer] ?? payload.retailer : 'Retailer';
  const isUrlOnly = !payload.productName && !payload.orderDate && !!payload.orderNumber;

  const header = (
    <div className="px-6 py-4 border-b border-[rgba(196,198,207,0.15)]">
      <h2 className={typography.modalTitle}>Import from {retailerLabel}</h2>
      <p className={`${typography.caption} text-[#74777f] mt-1`}>
        Review the order details below, then confirm to pre-fill the add-product form.
      </p>
    </div>
  );

  const body = (
    <div className="px-6 py-5 space-y-4">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className={colors.text.muted}>Order #</dt>
        <dd className="font-medium text-[#1b1c19]">{payload.orderNumber || '—'}</dd>
        <dt className={colors.text.muted}>Order date</dt>
        <dd className="font-medium text-[#1b1c19]">{payload.orderDate || '—'}</dd>
        <dt className={colors.text.muted}>Order total</dt>
        <dd className="font-medium text-[#1b1c19]">
          {payload.orderTotal != null ? formatCurrency(payload.orderTotal) : '—'}
        </dd>
      </dl>

      {isUrlOnly && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          Only the order number was detected. You may need to fill in product details manually.
        </p>
      )}

      {products.length > 0 && (
        <div className="space-y-2">
          <p className={`${typography.captionStrong} text-[#43474e]`}>
            Product{products.length > 1 ? 's' : ''} ({products.length})
          </p>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {products.map((product, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                    selectedIndex === index
                      ? 'border-[#022448] bg-[#022448]/5'
                      : 'border-[rgba(196,198,207,0.4)] hover:bg-[#eae8e2]/50'
                  }`}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#eae8e2]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#eae8e2] shrink-0 flex items-center justify-center text-lg">
                      📦
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1b1c19] line-clamp-2">
                      {product.productName || 'Unnamed product'}
                    </p>
                    {product.price != null && (
                      <p className={`${typography.caption} text-[#74777f] mt-0.5`}>
                        {formatCurrency(product.price)}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {products.length > 1 && (
            <p className={`${typography.caption} text-[#74777f]`}>
              Select a product to import. Add others by running the bookmarklet again or editing manually.
            </p>
          )}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex gap-3 w-full">
      <button type="button" onClick={onDismiss} className={formFooterCancelClass}>
        Cancel
      </button>
      <button
        type="button"
        onClick={() => onConfirm(payload, selectedIndex)}
        className={formFooterPrimaryClass}
      >
        Import &amp; Add Product
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      header={header}
      body={body}
      footer={footer}
      showCloseButton={false}
      size="md"
    />
  );
};

export default RetailerImportPreviewModal;
