import React, { useState, useEffect } from 'react';
import { Product } from '../../types/Product';
import { colors } from '../../utils/colors';
import { Modal } from '../common';
import { useVendors } from '../../hooks/useVendors';
import { formatCurrency } from '../../utils/currency';

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onSave,
  onCancel
}) => {
  const { activeVendors, DEFAULT_VENDOR_ID } = useVendors();
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });

  // Update editedProduct when product prop changes
  useEffect(() => {
    setEditedProduct({ ...product });
  }, [product]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: 'paid' | 'received', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    const newProduct = {
      ...editedProduct,
      [field]: numValue
    };

    // Auto-calculate delta when paid or received changes
    if (newProduct.paid !== null && newProduct.received !== null) {
      newProduct.delta = newProduct.received - newProduct.paid;
    } else if (newProduct.paid !== null && newProduct.received === null) {
      newProduct.delta = -newProduct.paid;
    } else if (newProduct.paid === null && newProduct.received !== null) {
      newProduct.delta = newProduct.received;
    } else {
      newProduct.delta = null;
    }

    setEditedProduct(newProduct);
  };

  const handleSave = () => {
    onSave(editedProduct);
  };

  const handleMarkAsVoid = () => {
    const voidProduct = { ...editedProduct, isVoid: true };
    onSave(voidProduct);
  };

  const handleUnVoid = () => {
    const unVoidProduct = { ...editedProduct, isVoid: false };
    onSave(unVoidProduct);
  };

  const modalBody = (
    <div className="p-6 space-y-6">
      {/* Product Name */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Product Name</label>
        <textarea
          value={editedProduct.item}
          onChange={(e) => handleInputChange('item', e.target.value)}
          className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md resize-vertical min-h-[4rem]`}
          placeholder="Product name"
          rows={3}
        />
      </div>

      {/* Product URL */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Product URL</label>
        <input
          type="url"
          value={editedProduct.url || ''}
          onChange={(e) => handleInputChange('url', e.target.value || null)}
          className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
          placeholder="https://amazon.com/..."
        />
      </div>

      {/* Product Image URL */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Product Image URL</label>
        <input
          type="url"
          value={editedProduct.imageUrl || ''}
          onChange={(e) => handleInputChange('imageUrl', e.target.value || null)}
          className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Order Date */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Order Date</label>
        <input
          type="date"
          value={editedProduct.orderDate || ''}
          onChange={(e) => handleInputChange('orderDate', e.target.value || null)}
          className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
        />
      </div>

      {/* Order Number - Hidden field for search purposes */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Order Number</label>
        <input
          type="text"
          value={editedProduct.orderNumber || ''}
          onChange={(e) => handleInputChange('orderNumber', e.target.value || null)}
          className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
          placeholder="Enter order number for search purposes"
        />
      </div>

      {/* Vendor Selection */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Vendor</label>
        <select
          value={editedProduct.vendorId || DEFAULT_VENDOR_ID}
          onChange={(e) => handleInputChange('vendorId', e.target.value)}
          className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
        >
          <option value="">Select a vendor...</option>
          {activeVendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Checkboxes */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-3`}>Order Status</label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={editedProduct.orderPlaced}
              onChange={(e) => handleInputChange('orderPlaced', e.target.checked)}
              className={`w-8 h-8 ${colors.form.checkbox} rounded focus:ring-blue-500`}
            />
            <span className={`text-sm ${colors.text.secondary}`}>Order Placed</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={editedProduct.orderDelivered}
              onChange={(e) => handleInputChange('orderDelivered', e.target.checked)}
              className={`w-8 h-8 ${colors.form.checkbox} rounded focus:ring-blue-500`}
            />
            <span className={`text-sm ${colors.text.secondary}`}>Order Delivered</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={editedProduct.reviewAdded}
              onChange={(e) => handleInputChange('reviewAdded', e.target.checked)}
              className={`w-8 h-8 ${colors.form.checkbox} rounded focus:ring-blue-500`}
            />
            <span className={`text-sm ${colors.text.secondary}`}>Review Added</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={editedProduct.reviewLive}
              onChange={(e) => handleInputChange('reviewLive', e.target.checked)}
              className={`w-8 h-8 ${colors.form.checkbox} rounded focus:ring-blue-500`}
            />
            <span className={`text-sm ${colors.text.secondary}`}>Review Live</span>
          </label>
          <label className="flex items-center space-x-3 col-span-2">
            <input
              type="checkbox"
              checked={editedProduct.reviewSSSent}
              onChange={(e) => handleInputChange('reviewSSSent', e.target.checked)}
              className={`w-8 h-8 ${colors.form.checkbox} rounded focus:ring-blue-500`}
            />
            <span className={`text-sm ${colors.text.secondary}`}>Screenshot Sent</span>
          </label>
        </div>
      </div>

      {/* Financial Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm ${colors.form.label} mb-2`}>Amount Paid ($)</label>
          <input
            type="number"
            step="0.01"
            value={editedProduct.paid || ''}
            onChange={(e) => handleNumberChange('paid', e.target.value)}
            className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className={`block text-sm ${colors.form.label} mb-2`}>Amount Received ($)</label>
          <input
            type="number"
            step="0.01"
            value={editedProduct.received || ''}
            onChange={(e) => handleNumberChange('received', e.target.value)}
            className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Delta Display */}
      <div>
        <label className={`block text-sm ${colors.form.label} mb-2`}>Profit/Loss (Auto-calculated)</label>
        <div className={`text-lg font-semibold px-3 py-2 rounded-md border ${editedProduct.delta !== null && editedProduct.delta >= 0
          ? colors.financial.positive
          : editedProduct.delta !== null
            ? colors.financial.negative
            : colors.financial.neutral
          }`}>
          {formatCurrency(editedProduct.delta || 0)}
        </div>
      </div>
      {editedProduct.isVoid ? (
        <button
          onClick={handleUnVoid}
          className={`px-4 py-2 ${colors.modal.void.unvoidButton} rounded-md transition-colors`}
        >
          Un-Void Product
        </button>
      ) : (
        <button
          onClick={handleMarkAsVoid}
          className={`px-4 py-2 ${colors.modal.void.button} rounded-md transition-colors`}
        >
          Mark as Void
        </button>
      )}
    </div>
  );

  const modalFooter = (
    <form onSubmit={handleSave}>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 px-4 py-3 ${colors.button.secondary} rounded-lg font-medium text-base`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-3 ${colors.button.primary} rounded-lg font-medium text-base`}
        >
          Update
        </button>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Edit Product"
      body={modalBody}
      footer={modalFooter}
      size="md"
    />
  );
};

export default EditProductModal;
