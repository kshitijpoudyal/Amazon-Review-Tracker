import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types/Product';

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
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });

  // Update editedProduct when product prop changes
  useEffect(() => {
    setEditedProduct({ ...product });
  }, [product]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

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

  if (!isOpen) return null;

  console.log('EditProductModal rendering with isOpen:', isOpen, 'product:', product);

  return createPortal(
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <textarea
              value={editedProduct.item}
              onChange={(e) => handleInputChange('item', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[4rem]"
              placeholder="Product name"
              rows={3}
            />
          </div>

          {/* Product URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product URL</label>
            <input
              type="url"
              value={editedProduct.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://amazon.com/..."
            />
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
            <input
              type="date"
              value={editedProduct.orderDate || ''}
              onChange={(e) => handleInputChange('orderDate', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Order Status</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editedProduct.orderPlaced}
                  onChange={(e) => handleInputChange('orderPlaced', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Order Placed</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editedProduct.orderDelivered}
                  onChange={(e) => handleInputChange('orderDelivered', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Order Delivered</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editedProduct.reviewAdded}
                  onChange={(e) => handleInputChange('reviewAdded', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Review Added</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editedProduct.reviewLive}
                  onChange={(e) => handleInputChange('reviewLive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Review Live</span>
              </label>
              <label className="flex items-center space-x-3 col-span-2">
                <input
                  type="checkbox"
                  checked={editedProduct.reviewSSSent}
                  onChange={(e) => handleInputChange('reviewSSSent', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Screenshot Sent</span>
              </label>
            </div>
          </div>

          {/* Financial Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid ($)</label>
              <input
                type="number"
                step="0.01"
                value={editedProduct.paid || ''}
                onChange={(e) => handleNumberChange('paid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received ($)</label>
              <input
                type="number"
                step="0.01"
                value={editedProduct.received || ''}
                onChange={(e) => handleNumberChange('received', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Delta Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profit/Loss (Auto-calculated)</label>
            <div className={`text-lg font-semibold px-3 py-2 rounded-md border ${
              editedProduct.delta !== null && editedProduct.delta >= 0 
                ? 'text-green-600 bg-green-50 border-green-200' 
                : editedProduct.delta !== null
                ? 'text-red-600 bg-red-50 border-red-200'
                : 'text-gray-500 bg-gray-50 border-gray-200'
            }`}>
              ${editedProduct.delta?.toFixed(2) || '0.00'}
            </div>
          </div>
          <button
            onClick={handleMarkAsVoid}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            Mark as Void
          </button>
        </div>

        

        {/* Modal Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditProductModal;
