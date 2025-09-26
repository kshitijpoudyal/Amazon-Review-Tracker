import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types/Product';
import { colors } from '../utils/colors';
import { Modal } from './common';

interface ProductDropdownProps {
  products: Product[];
  selectedProductId: string | null;
  onProductSelect: (productId: string | null) => void;
  disabled?: boolean;
  loading?: boolean;
  linkedProductIds?: string[]; // Array of product IDs that are already linked to transactions
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  disabled = false,
  linkedProductIds = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedProductId, setTempSelectedProductId] = useState<string | null>(selectedProductId);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected product
  const selectedProduct = products.find(p => p.id === selectedProductId);

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

  const handleProductClick = (productId: string | null) => {
    setTempSelectedProductId(productId);
  };

  const handleSave = () => {
    onProductSelect(tempSelectedProductId);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
    setTempSelectedProductId(selectedProductId); // Reset to original selection
  };

  // Helper function to render a product item
  const renderProductItem = (product: Product, isLinked: boolean = false) => (
    <li
      key={product.id}
      onClick={() => handleProductClick(product.id || null)}
      className={`flex gap-x-4 px-4 py-3 cursor-pointer ${colors.modal.item.hover} ${tempSelectedProductId === product.id ? colors.modal.item.selected : ''
        }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isLinked ? colors.text.green : colors.text.primary}`}>
          {product.item.length > 50 ? `${product.item.substring(0, 50)}...` : product.item}
        </p>
        <p className={`mt-1 truncate text-xs ${isLinked ? colors.text.green : colors.text.primary}`}>
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

  const getButtonClassName = () => {
    const baseClass = `${colors.form.input.base} ${colors.background.primary} ${colors.form.input.disabled} disabled:cursor-not-allowed flex items-center justify-between`;
    return `w-full min-w-48 max-w-96 px-3 py-2 ${baseClass}`;
  };

  const getDisplayText = () => {
    if (selectedProduct) {
      return selectedProduct.item.length > 25 ? `${selectedProduct.item.substring(0, 25)}...` : selectedProduct.item;
    }
    return 'No Product Linked';
  };

  const modalHeader = (
    <div className="mb-4">
      <h3 className={`text-lg font-medium ${colors.text.primary} mb-4`}>
        Select Product to Link
      </h3>
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
    <form onSubmit={handleSave}>
      {(tempSelectedProductId != null) && (
        <button
          type="button"
          onClick={() => handleProductClick(null)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${colors.button.danger}`}
        >
          <span>Remove Product Link</span>
        </button>
      )}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleCloseModal}
          className={`flex-1 px-4 py-3 ${colors.button.secondary} rounded-lg font-medium text-base`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-3 ${colors.button.primary} rounded-lg font-medium text-base`}
        >
          Add Product
        </button>
      </div>
    </form>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setTempSelectedProductId(selectedProductId); // Initialize temp selection
            setIsModalOpen(true);
          }
        }}
        disabled={disabled}
        className={getButtonClassName()}
      >
        <span className={selectedProduct ? colors.text.primary : colors.text.muted}>
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
