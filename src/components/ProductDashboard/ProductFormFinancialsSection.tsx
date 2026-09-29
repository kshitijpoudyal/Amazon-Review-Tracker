import React from 'react';
import { Product } from '../../types/Product';
import { formatCurrency } from '../../utils/currency';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';
import { ProductFormCurrencyInput } from './ProductFormCurrencyInput';
import { formLabelClass, FORM_CONTROL_HEIGHT } from './productFormStyles';
import { typography } from '../../utils/typography';
import {
  getExpectedReceivedForProduct,
  getRefundVariance,
  getProductRefundExpectation,
  getRefundExpectationSummary,
} from '../../utils/refundUtils';

interface ProductFormFinancialsSectionProps {
  product: Product;
  onPaidChange: (value: string) => void;
  onReceivedChange: (value: string) => void;
  onResetDelta?: () => void;
}

function deltaDisplayClass(delta: number | null): string {
  if (delta === null) return `${typography.numericStrong} text-[#74777f] tabular-nums`;
  if (delta < 0) return `${typography.numericStrong} text-[#ba1a1a] tabular-nums`;
  if (delta > 0) return `${typography.numericStrong} text-[#006a68] tabular-nums`;
  return `${typography.numericStrong} text-[#43474e] tabular-nums`;
}

export const ProductFormFinancialsSection: React.FC<ProductFormFinancialsSectionProps> = ({
  product,
  onPaidChange,
  onReceivedChange,
  onResetDelta,
}) => {
  const expectation = getProductRefundExpectation(product);
  const expectedReceived = getExpectedReceivedForProduct(product);
  const variance =
    expectedReceived != null && product.received != null
      ? getRefundVariance(expectedReceived, product.received)
      : null;

  return (
  <div className="px-6 py-5 space-y-4">
    <ProductFormSectionHeader title="Financials" />

    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="min-w-0">
        <label htmlFor="edit-amount-paid" className={formLabelClass}>Amount paid</label>
        <ProductFormCurrencyInput
          id="edit-amount-paid"
          value={product.paid}
          onChange={onPaidChange}
        />
      </div>
      <div className="min-w-0">
        <label htmlFor="edit-amount-received" className={formLabelClass}>Amount received</label>
        <ProductFormCurrencyInput
          id="edit-amount-received"
          value={product.received}
          onChange={onReceivedChange}
        />
      </div>
      <div className="min-w-0">
        <p className={formLabelClass}>Delta</p>
        <div
          className={`${FORM_CONTROL_HEIGHT} flex items-center px-2 sm:px-3 rounded-xl bg-[#eae8e2]/50 border border-[rgba(196,198,207,0.35)] ${deltaDisplayClass(product.delta)}`}
          aria-readonly="true"
        >
          {product.delta !== null ? formatCurrency(product.delta) : '—'}
        </div>
      </div>
    </div>

    {product.paid != null && (
      <div className="px-3 py-2 rounded-xl bg-[#eae8e2]/40 border border-[rgba(196,198,207,0.3)] space-y-1">
        <p className={`${typography.caption} text-[#74777f]`}>
          Expected refund:{' '}
          <span className={`${typography.bodyStrong} text-[#43474e] tabular-nums`}>
            {expectedReceived != null ? formatCurrency(expectedReceived) : '—'}
          </span>
          {' · '}
          {getRefundExpectationSummary(expectation, product.paid)}
        </p>
        {variance && (
          <p
            className={`${typography.caption} tabular-nums ${
              variance.variance < -0.01
                ? 'text-[#ba1a1a]'
                : variance.variance > 0.01
                  ? 'text-[#006a68]'
                  : 'text-[#43474e]'
            }`}
          >
            {variance.label}
          </p>
        )}
      </div>
    )}

    {product.delta !== null && onResetDelta && (
      <button
        type="button"
        onClick={onResetDelta}
        className={`${typography.caption} text-[#74777f] hover:text-[#1b1c19] underline transition-colors`}
      >
        Reset delta to null
      </button>
    )}
  </div>
  );
};

export default ProductFormFinancialsSection;
