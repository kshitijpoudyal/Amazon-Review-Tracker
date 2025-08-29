import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types/Product';

interface ProductDropdownProps {
  products: Product[];
  selectedProductId: string | null;
  onProductSelect: (productId: string | null) => void;
  disabled?: boolean;
  size?: 'small' | 'normal';
  loading?: boolean;
  linkedProductIds?: string[]; // Array of product IDs that are already linked to transactions
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  disabled = false,
  size = 'normal',
  loading = false,
  linkedProductIds = []
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedProductId, setTempSelectedProductId] = useState<string | null>(selectedProductId);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debug: Log products array and component state
  console.log('🔍 ProductDropdown - Props received:', {
    productsLength: products.length,
    products,
    selectedProductId,
    disabled,
    loading,
    isModalOpen,
    linkedProductIds
  });

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
    
    return nameMatch || paidMatch || receivedMatch;
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
      className={`flex gap-x-4 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
        tempSelectedProductId === product.id ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isLinked ? 'text-green-700' : 'text-gray-900'}`}>
          {product.item.length > 50 ? `${product.item.substring(0, 50)}...` : product.item}
          {isLinked && <span className="ml-2 text-xs text-green-600">(Already Linked)</span>}
        </p>
        <p className={`mt-1 truncate text-xs ${isLinked ? 'text-green-600' : 'text-gray-500'}`}>
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
      <div className="flex items-center">
        {tempSelectedProductId === product.id && (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </li>
  );

  const getButtonClassName = () => {
    const baseClass = "border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between";
    
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
            console.log('🔍 ProductDropdown - Button clicked, disabled:', disabled);
            if (!disabled) {
              console.log('🔍 ProductDropdown - Opening modal');
              setTempSelectedProductId(selectedProductId); // Initialize temp selection
              setIsModalOpen(true);
            }
          }}
          disabled={disabled}
          className={getButtonClassName()}
        >
          <span className={selectedProduct ? 'text-gray-900' : 'text-gray-500'}>
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Select Product to Link
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Products List - Scrollable */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
                <div className="border border-gray-200 rounded">
                  <ul role="list" className="divide-y divide-gray-100"> 
                  {(unlinkedProducts.length > 0 || linkedProducts.length > 0) ? (
                    <>
                      {/* Unlinked Products */}
                      {unlinkedProducts.map((product) => renderProductItem(product, false))}
                      
                      {/* Divider between unlinked and linked products */}
                      {unlinkedProducts.length > 0 && linkedProducts.length > 0 && (
                        <li className="px-4 py-2 bg-gray-50 border-t-2 border-gray-300">
                          <div className="flex items-center">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="mx-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Already Linked Products
                            </span>
                            <div className="flex-1 border-t border-gray-300"></div>
                          </div>
                        </li>
                      )}
                      
                      {/* Linked Products */}
                      {linkedProducts.map((product) => renderProductItem(product, true))}
                    </>
                  ) : searchTerm ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <div>No products found matching "{searchTerm}"</div>
                      <div className="text-sm">Try a different search term</div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <div>No products available</div>
                      <div className="text-sm">Add some products first to link them to PayPal transactions</div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <div>Start typing to search {products.length} products</div>
                    </div>
                  )}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* No Product Linked Option */}
                <button
                  type="button"
                  onClick={() => handleProductClick(null)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    tempSelectedProductId === null 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {tempSelectedProductId === null && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>No Product Linked</span>
                </button>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
