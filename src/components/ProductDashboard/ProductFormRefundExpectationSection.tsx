import React, { useRef } from 'react';
import { Product, RefundExpectation } from '../../types/Product';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';
import { ProductFormCurrencyInput } from './ProductFormCurrencyInput';
import { formLabelClass, formTextareaClass } from './productFormStyles';
import { typography } from '../../utils/typography';
import { formatCurrency } from '../../utils/currency';
import {
  getDefaultPayPalFee,
  getExpectedReceived,
  getProductRefundExpectation,
  getProductTax,
  getRefundExpectationSummary,
  hasRefundExpectation,
  resolveExcludedTaxAmount,
} from '../../utils/refundUtils';

interface ProductFormRefundExpectationSectionProps {
  product: Product;
  onChange: (expectation: RefundExpectation) => void;
}

function parseAmount(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const ProductFormRefundExpectationSection: React.FC<
  ProductFormRefundExpectationSectionProps
> = ({ product, onChange }) => {
  const expectation = getProductRefundExpectation(product);
  const expectedReceived = getExpectedReceived(product.paid, expectation);
  const feeManuallySet = useRef(false);

  const update = (patch: Partial<RefundExpectation>) => {
    onChange({ ...expectation, ...patch });
  };

  const handlePayPalFeeToggle = (checked: boolean) => {
    if (checked) {
      feeManuallySet.current = false;
      update({
        excludePayPalFee: true,
        paypalFeeAmount: getDefaultPayPalFee(product.paid),
      });
      return;
    }
    feeManuallySet.current = false;
    update({ excludePayPalFee: false, paypalFeeAmount: null });
  };

  const handlePayPalFeeChange = (value: string) => {
    feeManuallySet.current = true;
    update({ paypalFeeAmount: parseAmount(value) });
  };

  const checkboxClass =
    'mt-0.5 h-4 w-4 rounded border-[rgba(196,198,207,0.65)] text-[#022448] focus:ring-[#022448]/20';

  return (
    <div className="px-6 py-5 space-y-4">
      <ProductFormSectionHeader title="Expected refund" />

      <div className="space-y-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={expectation.excludeTax}
            onChange={(e) => {
              const checked = e.target.checked;
              update({
                excludeTax: checked,
                taxAmount: checked
                  ? resolveExcludedTaxAmount(expectation, getProductTax(product))
                  : null,
              });
            }}
            className={checkboxClass}
          />
          <span className={`${typography.body} text-[#1b1c19] flex-1`}>
            Tax excluded (won&apos;t receive tax back)
          </span>
        </label>
        {expectation.excludeTax && (
          <div className="ml-6 max-w-[12rem]">
            <label htmlFor="refund-tax-amount" className={formLabelClass}>
              Tax amount
            </label>
            <ProductFormCurrencyInput
              id="refund-tax-amount"
              value={expectation.taxAmount}
              onChange={(value) => update({ taxAmount: parseAmount(value) })}
            />
          </div>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={expectation.customDeduction !== null}
            onChange={(e) =>
              update({
                customDeduction: e.target.checked ? (expectation.customDeduction ?? 0) : null,
              })
            }
            className={checkboxClass}
          />
          <span className={`${typography.body} text-[#1b1c19] flex-1`}>
            Additional deduction ($X less)
          </span>
        </label>
        {expectation.customDeduction != null && (
          <div className="ml-6 max-w-[12rem]">
            <label htmlFor="refund-custom-deduction" className={formLabelClass}>
              Deduction amount
            </label>
            <ProductFormCurrencyInput
              id="refund-custom-deduction"
              value={expectation.customDeduction}
              onChange={(value) => update({ customDeduction: parseAmount(value) })}
            />
          </div>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={expectation.excludePayPalFee}
            onChange={(e) => handlePayPalFeeToggle(e.target.checked)}
            className={checkboxClass}
          />
          <span className={`${typography.body} text-[#1b1c19] flex-1`}>
            PayPal fee excluded (defaults to 4.5% of paid)
          </span>
        </label>
        {expectation.excludePayPalFee && (
          <div className="ml-6 max-w-[12rem]">
            <label htmlFor="refund-paypal-fee" className={formLabelClass}>
              PayPal fee amount
            </label>
            <ProductFormCurrencyInput
              id="refund-paypal-fee"
              value={expectation.paypalFeeAmount}
              onChange={handlePayPalFeeChange}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="refund-notes" className={formLabelClass}>
          Refund notes (optional)
        </label>
        <textarea
          id="refund-notes"
          value={expectation.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          className={formTextareaClass}
          rows={2}
          placeholder="e.g. vendor confirmed no tax refund"
        />
      </div>

      {product.paid != null && (
        <div className="px-3 py-2.5 rounded-xl bg-[#eae8e2]/50 border border-[rgba(196,198,207,0.35)]">
          <p className={`${typography.bodyStrong} text-[#1b1c19] tabular-nums`}>
            Expected refund: {expectedReceived != null ? formatCurrency(expectedReceived) : '—'}
          </p>
          <p className={`${typography.caption} text-[#74777f] mt-0.5`}>
            {getRefundExpectationSummary(expectation, product.paid)}
            {!hasRefundExpectation(expectation) && ' (no deductions)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductFormRefundExpectationSection;
