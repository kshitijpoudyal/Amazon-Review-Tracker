import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types/Product';

interface ProductDropdownProps {
  products: Product[];
  selectedProductId: string | null;
  onProductSelect: (productId: string | null) => void;
  disabled?: boolean;
  size?: 'small' | 'normal';
  loading?: boolean;
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  disabled = false,
  size = 'normal',
  loading = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debug: Log products array and component state
  console.log('🔍 ProductDropdown - Props received:', {
    productsLength: products.length,
    products,
    selectedProductId,
    disabled,
    loading,
    isModalOpen
  });

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
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
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
                {/* Products List */}
                <div className="overflow-x-auto border border-gray-200 rounded">
                  {/* No Product Option */}
                  <button
                    type="button"
                    onClick={() => handleProductSelect(null)}
                    className={`w-full px-4 py-3 text-left border-b border-gray-200 hover:bg-gray-50 ${
                      !selectedProductId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="font-medium">No Product Linked</span>
                    <div className="text-sm text-gray-500">Remove product link</div>
                  </button>


                  <ul role="list" className="divide-y divide-gray-100 dark:divide-white/5"> 
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <li key={product.item} className="flex gap-x-4">
                        <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product.id || null)}
                        className={`w-full px-2 py-2 text-left border-b border-gray-200 hover:bg-gray-50 ${
                          selectedProductId === product.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >

                        <div className="min-w-0">
                                <p className="text-sm/6 font-semibold text-gray-900 dark:text-black">
                                  {product.item.length > 50 ? `${product.item.substring(0, 50)}...` : product.item}
                                </p>
                                <p className="mt-1 truncate text-xs/5 text-gray-500 dark:text-gray-800">{product.paid}</p>
                            </div>

                        <div className="flex justify-between items-start">
                          {selectedProductId === product.id && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                      </li>
                    ))
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
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
