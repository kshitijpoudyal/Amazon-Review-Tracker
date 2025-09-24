import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types/Product';
import { colors, getBadgeClasses } from '../utils/colors';

interface MultipleProductDropdownProps {
  products: Product[];
  selectedProductIds: string[];
  onProductSelectionChange: (productIds: string[]) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  linkedProductIds?: string[]; // All product IDs that are already linked to other transactions
}

export const MultipleProductDropdown: React.FC<MultipleProductDropdownProps> = ({
  products,
  selectedProductIds,
  onProductSelectionChange,
  disabled = false,
  loading = false,
  linkedProductIds = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Get available products (not linked to other transactions, unless already selected) and filter by search
  const availableProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.paid && product.paid.toString().includes(searchTerm)) ||
      (product.received && product.received.toString().includes(searchTerm));
    
    const isAvailable = !linkedProductIds.includes(product.id!) || 
      selectedProductIds.includes(product.id!);
    
    return matchesSearch && isAvailable;
  });

  // Get selected product objects
  const selectedProducts = products.filter(product => 
    selectedProductIds.includes(product.id!)
  );

  const handleProductToggle = async (productId: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newSelectedIds = selectedProductIds.includes(productId)
        ? selectedProductIds.filter(id => id !== productId)
        : [...selectedProductIds, productId];
      
      await onProductSelectionChange(newSelectedIds);
    } catch (error) {
      console.error('Failed to update product selection:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newSelectedIds = selectedProductIds.filter(id => id !== productId);
      await onProductSelectionChange(newSelectedIds);
    } catch (error) {
      console.error('Failed to remove product:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`text-xs ${colors.text.muted}`}>
        Loading products...
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Products Display */}
      <div className="space-y-1 mb-2">
        {selectedProducts.length > 0 ? (
          selectedProducts.map(product => (
            <div
              key={product.id}
              className={`flex items-center justify-between ${getBadgeClasses('linked')} text-xs py-1 px-2`}
            >
              <span className="truncate max-w-32" title={product.item}>
                {product.item}
              </span>
              <button
                onClick={() => handleRemoveProduct(product.id!)}
                disabled={disabled || isUpdating}
                className="ml-1 text-green-700 hover:text-green-900 disabled:opacity-50"
                title="Remove product link"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <span className={getBadgeClasses('unlinked')}>
            No products linked
          </span>
        )}
      </div>

      {/* Add Product Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setSearchTerm(''); // Clear search when opening
          }
        }}
        disabled={disabled || isUpdating || products.length === 0}
        className={`
          w-full text-left px-3 py-2 text-xs rounded-md border transition-colors
          ${colors.form.input.base}
          ${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}
        `}
        title={products.length === 0 ? 'No products available' : 'Add product link'}
      >
        {isUpdating ? (
          <span className="flex items-center">
            <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
            Updating...
          </span>
        ) : (
          <span className="flex items-center justify-between">
            <span>{products.length === 0 ? 'No products available' : 'Add product link'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-1 max-h-60 
          ${colors.background.primary} ${colors.border.default} 
          rounded-md shadow-lg
        `}>
          {/* Search Input */}
          <div className="sticky top-0 p-2 bg-white border-b">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by product name, paid amount, or received amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full px-2 py-1 text-xs rounded border
                ${colors.form.input.base}
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              `}
            />
          </div>
          
          {/* Products List */}
          <div className="max-h-40 overflow-y-auto">
            {availableProducts.length > 0 ? (
              availableProducts.map(product => {
                const isSelected = selectedProductIds.includes(product.id!);
                const isLinkedElsewhere = linkedProductIds.includes(product.id!) && !isSelected;
                // A product should show in green if it has a received amount > 0 (meaning it's linked to transactions)
                const hasTransactionLinks = product.received && product.received > 0;
                
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductToggle(product.id!)}
                    disabled={isLinkedElsewhere || isUpdating}
                    className={`
                      w-full text-left px-3 py-2 text-xs transition-colors
                      ${isSelected 
                        ? hasTransactionLinks
                          ? 'bg-green-50 text-green-700 font-medium border-l-2 border-green-400' 
                          : 'bg-blue-50 text-blue-700 font-medium'
                        : isLinkedElsewhere 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : hasTransactionLinks
                            ? 'text-green-600 hover:bg-green-50 font-medium'
                            : `${colors.text.primary} hover:bg-gray-50`
                      }
                      ${!isLinkedElsewhere ? 'hover:bg-gray-100' : ''}
                    `}
                    title={
                      isLinkedElsewhere 
                        ? 'This product is already linked to another transaction'
                        : isSelected 
                          ? 'Click to unlink this product'
                          : hasTransactionLinks
                            ? 'This product is linked to transactions'
                            : 'Click to link this product'
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <span className={`${
                          hasTransactionLinks 
                            ? isSelected 
                              ? 'text-green-700 font-semibold' 
                              : 'text-green-600 font-medium' 
                            : isSelected 
                              ? 'text-blue-700' 
                              : ''
                        }`}>
                          {product.item}
                        </span>
                        {product.paid && (
                          <span className={`ml-2 ${
                            hasTransactionLinks 
                              ? 'text-green-500' 
                              : 'text-gray-500'
                          }`}>
                            (${product.paid})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {isSelected && (
                          <svg className={`w-3 h-3 ${
                            hasTransactionLinks ? 'text-green-600' : 'text-blue-600'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isLinkedElsewhere && (
                          <span className="text-xs text-gray-400">Linked</span>
                        )}
                        {hasTransactionLinks && !isSelected && !isLinkedElsewhere && (
                          <div className="flex items-center">
                            <span className="text-xs text-green-600 font-medium">Linked</span>
                            <span className="text-xs text-green-600 ml-1">●</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-xs text-gray-500 text-center">
                {searchTerm ? 'No products found matching your search' : 'No available products to link'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};