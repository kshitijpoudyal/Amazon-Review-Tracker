import React from 'react';
import { Product } from '../../types/Product';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';
import { ProductFormCurrencyInput } from './ProductFormCurrencyInput';
import { formInputClass, formLabelClass, formTextareaClass } from './productFormStyles';
import type { Vendor } from '../../types/Product';

interface ProductFormProductDetailsSectionProps {
  product: Product;
  activeVendors: Vendor[];
  defaultVendorId: string;
  onChange: (field: keyof Product, value: string | null) => void;
  mode?: 'add' | 'edit';
  nameRequired?: boolean;
  paidRequired?: boolean;
  onPaidChange?: (value: string) => void;
}

export const ProductFormProductDetailsSection: React.FC<ProductFormProductDetailsSectionProps> = ({
  product,
  activeVendors,
  defaultVendorId,
  onChange,
  mode = 'edit',
  nameRequired = false,
  paidRequired = false,
  onPaidChange,
}) => (
  <div className="px-6 py-5 space-y-4">
    <ProductFormSectionHeader title="Product details" />

    <div>
      <label htmlFor="product-name" className={formLabelClass}>
        Name {nameRequired && <span className="text-[#ba1a1a]">*</span>}
      </label>
      <textarea
        id="product-name"
        value={product.item}
        onChange={(e) => onChange('item', e.target.value)}
        className={formTextareaClass}
        rows={2}
        placeholder="Product name"
        required={nameRequired}
      />
    </div>

    {mode === 'add' ? (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="product-vendor" className={formLabelClass}>
              Vendor {nameRequired && <span className="text-[#ba1a1a]">*</span>}
            </label>
            <select
              id="product-vendor"
              value={product.vendorId || defaultVendorId}
              onChange={(e) => onChange('vendorId', e.target.value)}
              className={formInputClass}
              required={nameRequired}
            >
              <option value="">Select a vendor...</option>
              {activeVendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-order-date" className={formLabelClass}>Order date</label>
            <input
              id="product-order-date"
              type="date"
              value={product.orderDate || ''}
              onChange={(e) => onChange('orderDate', e.target.value || null)}
              className={formInputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="product-order-number" className={formLabelClass}>Order number</label>
            <input
              id="product-order-number"
              type="text"
              value={product.orderNumber || ''}
              onChange={(e) => onChange('orderNumber', e.target.value || null)}
              className={formInputClass}
              placeholder="AMZ-..."
            />
          </div>
          <div>
            <label htmlFor="product-amount-paid" className={formLabelClass}>
              Amount paid {paidRequired && <span className="text-[#ba1a1a]">*</span>}
            </label>
            {onPaidChange && (
              <ProductFormCurrencyInput
                id="product-amount-paid"
                value={product.paid}
                onChange={onPaidChange}
                required={paidRequired}
              />
            )}
          </div>
        </div>
      </>
    ) : (
      <>
        <div>
          <label htmlFor="product-vendor" className={formLabelClass}>Vendor</label>
          <select
            id="product-vendor"
            value={product.vendorId || defaultVendorId}
            onChange={(e) => onChange('vendorId', e.target.value)}
            className={formInputClass}
          >
            <option value="">Select a vendor...</option>
            {activeVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="product-order-date" className={formLabelClass}>Order date</label>
            <input
              id="product-order-date"
              type="date"
              value={product.orderDate || ''}
              onChange={(e) => onChange('orderDate', e.target.value || null)}
              className={formInputClass}
            />
          </div>
          <div>
            <label htmlFor="product-order-number" className={formLabelClass}>Order number</label>
            <input
              id="product-order-number"
              type="text"
              value={product.orderNumber || ''}
              onChange={(e) => onChange('orderNumber', e.target.value || null)}
              className={formInputClass}
              placeholder="AMZ-..."
            />
          </div>
        </div>
      </>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="min-w-0">
        <label htmlFor="product-url" className={formLabelClass}>Product URL</label>
        <input
          id="product-url"
          type="url"
          value={product.url || ''}
          onChange={(e) => onChange('url', e.target.value || null)}
          className={formInputClass}
          placeholder="https://amazon.com/..."
        />
      </div>
      <div className="min-w-0">
        <label htmlFor="product-image-url" className={formLabelClass}>Image URL</label>
        <input
          id="product-image-url"
          type="url"
          value={product.imageUrl || ''}
          onChange={(e) => onChange('imageUrl', e.target.value || null)}
          className={formInputClass}
          placeholder="https://..."
        />
      </div>
    </div>

  </div>
);

export default ProductFormProductDetailsSection;
