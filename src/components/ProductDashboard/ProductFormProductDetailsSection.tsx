import React from 'react';
import { Product } from '../../types/Product';
import { colors } from '../../utils/colors';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';
import type { Vendor } from '../../types/Product';

interface ProductFormProductDetailsSectionProps {
  product: Product;
  activeVendors: Vendor[];
  defaultVendorId: string;
  onChange: (field: keyof Product, value: string | null) => void;
  nameRequired?: boolean;
}

export const ProductFormProductDetailsSection: React.FC<ProductFormProductDetailsSectionProps> = ({
  product,
  activeVendors,
  defaultVendorId,
  onChange,
  nameRequired = false,
}) => (
  <div className="px-6 py-5 space-y-4">
    <ProductFormSectionHeader title="Product Details" />

    <div>
      <label className={`block ${colors.form.label} mb-1.5`}>
        Name {nameRequired && <span className="text-[#ba1a1a]">*</span>}
      </label>
      <textarea
        value={product.item}
        onChange={(e) => onChange('item', e.target.value)}
        className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl resize-none text-sm`}
        rows={2}
        placeholder="Product name"
        required={nameRequired}
      />
    </div>

    <div>
      <label className={`block ${colors.form.label} mb-1.5`}>
        Vendor {nameRequired && <span className="text-[#ba1a1a]">*</span>}
      </label>
      <select
        value={product.vendorId || defaultVendorId}
        onChange={(e) => onChange('vendorId', e.target.value)}
        className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
        required={nameRequired}
      >
        <option value="">Select a vendor...</option>
        {activeVendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={`block ${colors.form.label} mb-1.5`}>Order Date</label>
        <input
          type="date"
          value={product.orderDate || ''}
          onChange={(e) => onChange('orderDate', e.target.value || null)}
          className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
        />
      </div>
      <div>
        <label className={`block ${colors.form.label} mb-1.5`}>Order Number</label>
        <input
          type="text"
          value={product.orderNumber || ''}
          onChange={(e) => onChange('orderNumber', e.target.value || null)}
          className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
          placeholder="AMZ-..."
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className={`block ${colors.form.label} mb-1.5`}>Product URL</label>
        <input
          type="url"
          value={product.url || ''}
          onChange={(e) => onChange('url', e.target.value || null)}
          className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
          placeholder="https://amazon.com/..."
        />
      </div>
      <div>
        <label className={`block ${colors.form.label} mb-1.5`}>Image URL</label>
        <input
          type="url"
          value={product.imageUrl || ''}
          onChange={(e) => onChange('imageUrl', e.target.value || null)}
          className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
          placeholder="https://..."
        />
      </div>
    </div>
  </div>
);

export default ProductFormProductDetailsSection;
