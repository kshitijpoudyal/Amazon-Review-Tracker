import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types/Product';
import { colors } from '../utils/colors';
import { Modal } from './common';
import { getProductStatus } from '../utils/productStatus';

interface ProductDropdownProps {
  products: Product[];
  selectedProductIds: string[];
  onProductSelect: (productIds: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  linkedProductIds?: string[];
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  products,
  selectedProductIds,
  onProductSelect,
  disabled = false,
  linkedProductIds = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedProductIds, setTempSelectedProductIds] = useState<string[]>(selectedProductIds);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected products
  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id || ''));

  // Filter products based on search term and group by linked status
  const allFilteredProducts = products.filter(product => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.item?.toLowerCase().includes(searchLower);
    const paidMatch = product.paid?.toString().includes(searchTerm);
    const receivedMatch = product.received?.toString().includes(searchTerm);
    const orderNumberMatch = product.orderNumber?.toLowerCase().includes(searchLower);

    return nameMatch || paidMatch || receivedMatch || orderNumberMatch;
  });

  // Separate into linked and unlinked groups
  const unlinkedProducts = allFilteredProducts
    .filter(product => !linkedProductIds.includes(product.id || ''))
    .sort((a, b) => {
      // Sort by order date, most recent first
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    });

  const linkedProducts = allFilteredProducts
    .filter(product => linkedProductIds.includes(product.id || ''))
    .sort((a, b) => {
      // Sort by order date, most recent first
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    });

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  // ESC key handling is now managed by the Modal component

  const handleProductClick = (productId: string) => {
    if (true) {
      setTempSelectedProductIds(prev => {
        if (prev.includes(productId)) {
          // Remove if already selected
          return prev.filter(id => id !== productId);
        } else {
          // Add to selection
          return [...prev, productId];
        }
      });
    } else {
      // Single selection mode
      setTempSelectedProductIds([productId]);
    }
  };

  const handleRemoveAll = () => {
    setTempSelectedProductIds([]);
  };

  const handleSave = () => {
    onProductSelect(tempSelectedProductIds);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
    setTempSelectedProductIds(selectedProductIds); // Reset to original selection
  };

  // Helper function to render a product item
  const renderProductItem = (product: Product, isLinked: boolean = false) => {
    const isSelected = tempSelectedProductIds.includes(product.id || '');
    const productId = product.id || '';

    return (
      <li
        key={product.id}
        onClick={() => productId && handleProductClick(productId)}
        className={`flex gap-x-4 px-4 py-3 cursor-pointer ${colors.modal.item.hover} ${isSelected ? colors.modal.item.selected : ''}`}
      >
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => productId && handleProductClick(productId)}
            className={`w-4 h-4 ${colors.form.checkbox} rounded focus:ring-blue-500`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-semibold flex-1 ${isLinked ? colors.text.green : colors.text.primary}`}>
              {product.item.length > 50 ? `${product.item.substring(0, 50)}...` : product.item}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getProductStatus(product).color}`}
              title={getProductStatus(product).label}
            >
              {getProductStatus(product).label}
            </span>
          </div>
          <p className={`truncate text-xs ${isLinked ? colors.text.green : colors.text.primary}`}>
            {product.orderDate && (
              <>
                <span className="font-medium">
                  {new Date(product.orderDate).toLocaleDateString()}
                </span>
                {(product.paid || product.received) && ' • '}
              </>
            )}
            {product.paid && `Paid: $${product.paid}`}
            {product.paid && product.received && ' • '}
            {product.received && `Received: $${product.received}`}
          </p>
        </div>
      </li>
    );
  };

  const getButtonClassName = () => {
    const baseClass = `${colors.form.input.base} ${colors.background.primary} ${colors.form.input.disabled} disabled:cursor-not-allowed flex items-center justify-between`;
    return `w-full min-w-48 max-w-96 px-3 py-2 ${baseClass}`;
  };

  const getDisplayText = () => {
    if (selectedProducts.length === 0) {
      return 'No Product(s) Linked';
    } else if (selectedProducts.length === 1) {
      const product = selectedProducts[0];
      return product.item.length > 25 ? `${product.item.substring(0, 25)}...` : product.item;
    } else {
      return `${selectedProducts.length} Products Selected`;
    }
  };

  const modalHeader = (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${colors.text.primary}`}>
          {'Select Product(s) to Link'}
        </h3>
        {tempSelectedProductIds.length > 0 && (
          <span className={`text-sm ${colors.text.muted} bg-gray-100 px-2 py-1 rounded`}>
            {tempSelectedProductIds.length} selected
          </span>
        )}
      </div>
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search by product name, paid amount, or received amount..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md ${colors.form.input.placeholder}`}
      />
    </div>
  );

  const modalBody = (
    <div className="px-6">
      {/* Products List - Scrollable */}
      <div className={`${colors.border.default} rounded`}>
        <ul role="list" className="divide-y divide-gray-100">
          {(unlinkedProducts.length > 0 || linkedProducts.length > 0) ? (
            <>
              {/* Unlinked Products */}
              {unlinkedProducts.map((product) => renderProductItem(product, false))}

              {/* Divider between unlinked and linked products */}
              {unlinkedProducts.length > 0 && linkedProducts.length > 0 && (
                <li className={`px-4 py-2 ${colors.background.muted} border-t-2 ${colors.border.default}`}>
                  <div className="flex items-center">
                    <div className={`flex-1 border-t ${colors.border.default}`}></div>
                    <span className={`mx-3 text-xs font-medium ${colors.text.muted} uppercase tracking-wide`}>
                      Already Linked Products
                    </span>
                    <div className={`flex-1 border-t ${colors.border.default}`}></div>
                  </div>
                </li>
              )}

              {/* Linked Products */}
              {linkedProducts.map((product) => renderProductItem(product, true))}
            </>
          ) : searchTerm ? (
            <div className={`px-4 py-8 text-center ${colors.text.muted}`}>
              <div className="text-4xl mb-2">🔍</div>
              <div>No products found matching "{searchTerm}"</div>
              <div className="text-sm">Try a different search term</div>
            </div>
          ) : (
            <div className={`px-4 py-8 text-center ${colors.text.muted}`}>
              <div className="text-4xl mb-2">📦</div>
              <div>No products available</div>
              <div className="text-sm">Add some products first to link them to PayPal transactions</div>
            </div>
          )}
        </ul>
      </div>
    </div>
  );

  const modalFooter = (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      {/* Clear All / Remove Link Option */}
      {tempSelectedProductIds.length > 0 && (
        <button
          type="button"
          onClick={handleRemoveAll}
          className={`px-4 py-2 text-sm font-medium rounded-md ${colors.button.danger}`}
        >
          <span>{'Clear All'}</span>
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCloseModal}
          className={`px-4 py-2 text-sm font-medium rounded-md ${colors.button.secondary}`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={`px-4 py-2 text-sm font-medium rounded-md ${colors.button.primary}`}
        >
          {'Link Product(s)'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setTempSelectedProductIds(selectedProductIds); // Initialize temp selection
            setIsModalOpen(true);
          }
        }}
        disabled={disabled}
        className={getButtonClassName()}
      >
        <span className={selectedProducts.length > 0 ? colors.text.primary : colors.text.muted}>
          {getDisplayText()}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        header={modalHeader}
        body={modalBody}
        footer={modalFooter}
        size="md"
      />
    </>
  );
};
