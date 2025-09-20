import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types/Product';
import { colors } from '../utils/colors';

interface ProductModalProps {
  products: Product[];
  selectedProductId: string | null;
  onProductSelect: (productId: string | null) => void;
  disabled?: boolean;
  size?: 'small' | 'normal';
  loading?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  disabled = false,
  size = 'normal'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debug: Log products array and component state

  // Find selected product
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.item?.toLowerCase().includes(searchLower);
    const paidMatch = product.paid?.toString().includes(searchTerm);
    const receivedMatch = product.received?.toString().includes(searchTerm);
    
    return nameMatch || paidMatch || receivedMatch;
  });

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const handleProductSelect = (productId: string | null) => {
    onProductSelect(productId);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const getButtonClassName = () => {
    const baseClass = `${colors.form.input.base} ${colors.background.primary} ${colors.form.input.disabled} disabled:cursor-not-allowed flex items-center justify-between`;
    
    if (size === 'small') {
      return `text-xs px-2 py-1 ${baseClass}`;
    }
    
    return `w-full px-3 py-2 ${baseClass}`;
  };

  const getDisplayText = () => {
    if (selectedProduct) {
      let text = selectedProduct.item;
      const amounts = [];
      
      if (selectedProduct.paid) amounts.push(`Paid: $${selectedProduct.paid}`);
      if (selectedProduct.received) amounts.push(`Rec: $${selectedProduct.received}`);
      
      if (amounts.length > 0) {
        text += ` (${amounts.join(', ')})`;
      }
      
      return size === 'small' && text.length > 25 ? `${text.substring(0, 25)}...` : text;
    }
    return 'No Product Linked';
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className={`fixed inset-0 ${colors.modal.overlay} transition-opacity`}
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel */}
            <div className={`inline-block align-bottom ${colors.background.primary} rounded-lg text-left overflow-hidden ${colors.modal.shadow} transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              {/* Header */}
              <div className={`${colors.background.primary} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${colors.text.primary}`}>
                    Select Product to Link
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className={`${colors.button.close}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search by product name, paid amount, or received amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-3 py-2 ${colors.form.input.base} rounded-md`}
                  />
                </div>

                {/* Products List */}
                <div className={`max-h-96 overflow-y-auto ${colors.border.default} rounded`}>
                  {/* No Product Option */}
                  <button
                    type="button"
                    onClick={() => handleProductSelect(null)}
                    className={`w-full px-4 py-3 text-left border-b ${colors.border.default} ${colors.modal.item.hover} ${
                      !selectedProductId ? colors.modal.item.selected : colors.text.secondary
                    }`}
                  >
                    <span className="font-medium">No Product Linked</span>
                    <div className={`text-sm ${colors.text.muted}`}>Remove product link</div>
                  </button>

                  {/* Product Options */}
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product.id || null)}
                        className={`w-full px-4 py-3 text-left border-b ${colors.border.default} ${colors.modal.item.hover} ${
                          selectedProductId === product.id ? colors.modal.item.selected : colors.text.secondary
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{product.item}</div>
                            <div className="flex items-center space-x-4 mt-1">
                              {product.paid && (
                                <span className={`text-sm px-2 py-1 rounded ${colors.financial.badges.paid}`}>
                                  Paid: ${product.paid}
                                </span>
                              )}
                              {product.received && (
                                <span className={`text-sm px-2 py-1 rounded ${colors.financial.badges.received}`}>
                                  Received: ${product.received}
                                </span>
                              )}
                              {product.delta && (
                                <span className={`text-sm px-2 py-1 rounded ${
                                  product.delta > 0 
                                    ? colors.financial.badges.deltaPositive
                                    : colors.financial.badges.deltaNegative
                                }`}>
                                  Delta: ${product.delta}
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedProductId === product.id && (
                            <svg className={`w-5 h-5 ${colors.text.link}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))
                  ) : searchTerm ? (
                    <div className={`px-4 py-8 text-center ${colors.text.muted}`}>
                      <div className="text-4xl mb-2">🔍</div>
                      <div>No products found matching "{searchTerm}"</div>
                      <div className="text-sm">Try a different search term</div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className={`px-4 py-8 text-center ${colors.text.muted}`}>
                      <div className="text-4xl mb-2">📦</div>
                      <div>No products available</div>
                      <div className="text-sm">Add some products first to link them to PayPal transactions</div>
                    </div>
                  ) : (
                    <div className={`px-4 py-8 text-center ${colors.text.muted}`}>
                      <div className="text-4xl mb-2">📦</div>
                      <div>Start typing to search {products.length} products</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={`${colors.background.secondary} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`w-full inline-flex justify-center rounded-md border ${colors.border.default} shadow-sm px-4 py-2 ${colors.background.primary} text-base font-medium ${colors.text.secondary} ${colors.modal.item.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
