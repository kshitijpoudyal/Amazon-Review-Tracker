import React from 'react';
import { Product, ReviewMediaType } from '../../types/Product';
import { colors } from '../../utils/colors';
import { formatCurrency } from '../../utils/currency';
import { ReviewMediaTypeSelector } from '../common';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';

interface ProductFormFinancialsSectionProps {
  product: Product;
  mode: 'add' | 'edit';
  onPaidChange: (value: string) => void;
  onReceivedChange?: (value: string) => void;
  onResetDelta?: () => void;
  onReviewMediaTypeChange?: (value: ReviewMediaType) => void;
  paidRequired?: boolean;
}

export const ProductFormFinancialsSection: React.FC<ProductFormFinancialsSectionProps> = ({
  product,
  mode,
  onPaidChange,
  onReceivedChange,
  onResetDelta,
  onReviewMediaTypeChange,
  paidRequired = false,
}) => (
  <div className="px-6 py-5 space-y-4">
    <ProductFormSectionHeader title={mode === 'add' ? 'Order & Review' : 'Financials'} />

    {mode === 'edit' && (
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#ffdad6]/40 rounded-xl p-3 text-center">
          <p className="text-[9px] font-label uppercase tracking-widest text-[#74777f] mb-1">Paid</p>
          <p className="text-lg font-bold text-[#ba1a1a]">{formatCurrency(product.paid)}</p>
        </div>
        <div className="bg-[#006a68]/10 rounded-xl p-3 text-center">
          <p className="text-[9px] font-label uppercase tracking-widest text-[#74777f] mb-1">Received</p>
          <p className="text-lg font-bold text-[#006a68]">{formatCurrency(product.received)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${
          product.delta === null
            ? 'bg-[#eae8e2]'
            : product.delta >= 0
              ? 'bg-[#006a68]/10'
              : 'bg-[#ba1a1a]/10'
        }`}>
          <p className="text-[9px] font-label uppercase tracking-widest text-[#74777f] mb-1">Delta</p>
          <p className={`text-lg font-bold ${
            product.delta === null
              ? 'text-[#74777f]'
              : product.delta >= 0
                ? 'text-[#006a68]'
                : 'text-[#ba1a1a]'
          }`}>
            {product.delta !== null ? formatCurrency(product.delta) : '—'}
          </p>
        </div>
      </div>
    )}

    <div className={`grid gap-3 ${mode === 'edit' ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <div>
        <label className={`block ${colors.form.label} mb-1.5`}>
          Amount Paid ($) {paidRequired && <span className="text-[#ba1a1a]">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          value={product.paid ?? ''}
          onChange={(e) => onPaidChange(e.target.value)}
          className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
          placeholder="0.00"
          required={paidRequired}
        />
      </div>
      {mode === 'edit' && onReceivedChange && (
        <div>
          <label className={`block ${colors.form.label} mb-1.5`}>Amount Received ($)</label>
          <input
            type="number"
            step="0.01"
            value={product.received ?? ''}
            onChange={(e) => onReceivedChange(e.target.value)}
            className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
            placeholder="0.00"
          />
        </div>
      )}
    </div>

    {mode === 'edit' && product.delta !== null && onResetDelta && (
      <button
        type="button"
        onClick={onResetDelta}
        className="text-xs text-[#74777f] hover:text-[#1b1c19] underline transition-colors"
      >
        Reset delta to null
      </button>
    )}

    {mode === 'add' && onReviewMediaTypeChange && (
      <ReviewMediaTypeSelector
        value={product.reviewMediaType}
        onChange={onReviewMediaTypeChange}
      />
    )}
  </div>
);

export default ProductFormFinancialsSection;
