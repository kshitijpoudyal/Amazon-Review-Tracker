import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../types/Product';
import { Modal, Button } from './common';
import { getProductStatus } from '../utils/productStatus';

interface ProductDropdownProps {
  products: Product[];
  selectedProductIds: string[];
  onProductSelect: (productIds: string[]) => void;
  disabled?: boolean;
  linkedProductIds?: string[];
  onCloseModal?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  products,
  selectedProductIds,
  onProductSelect,
  disabled = false,
  linkedProductIds = [],
  onCloseModal,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen
}) => {
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedProductIds, setTempSelectedProductIds] = useState<string[]>(selectedProductIds);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use external modal state if provided, otherwise use internal state
  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsModalOpen;
  const setIsModalOpen = externalOnClose !== undefined 
    ? (open: boolean) => { if (!open) externalOnClose(); }
    : setInternalIsModalOpen;

  // Memoized computations for better performance
  const selectedProducts = useMemo(() =>
    products.filter(p => selectedProductIds.includes(p.id || '')),
    [products, selectedProductIds]
  );

  const { unlinkedProducts, linkedProducts } = useMemo(() => {
    const filtered = products.filter(product => {
      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase();
      return [
        product.item?.toLowerCase(),
        product.paid?.toString(),
        product.received?.toString(),
        product.orderNumber?.toLowerCase()
      ].some(field => field?.includes(searchLower));
    });

    const sortByDate = (a: Product, b: Product) => {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    };

    return {
      unlinkedProducts: filtered
        .filter(product => !linkedProductIds.includes(product.id || ''))
        .sort(sortByDate),
      linkedProducts: filtered
        .filter(product => linkedProductIds.includes(product.id || ''))
        .sort(sortByDate)
    };
  }, [products, searchTerm, linkedProductIds]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  // Event handlers
  const handleProductToggle = (productId: string) => {
    setTempSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleClearAll = () => setTempSelectedProductIds([]);

  const handleSave = () => {
    onProductSelect(tempSelectedProductIds);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
    setTempSelectedProductIds(selectedProductIds);
    onCloseModal?.();
  };

  const openModal = () => {
    if (!disabled) {
      setTempSelectedProductIds(selectedProductIds);
      if (externalOnOpen) {
        // External modal management - trigger parent to open modal
        externalOnOpen();
      } else {
        setIsModalOpen(true);
      }
    }
  };

  // Product item component
  const ProductItem = ({ product, isLinked = false }: { product: Product; isLinked?: boolean }) => {
    const isSelected = tempSelectedProductIds.includes(product.id || '');
    const productId = product.id || '';
    const status = getProductStatus(product);
    const truncatedName = product.item.length > 45
      ? `${product.item.substring(0, 45)}...`
      : product.item;

    return (
      <li
        key={product.id}
        onClick={() => productId && handleProductToggle(productId)}
        className={`group relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 rounded-lg mx-2 my-1 ${isSelected
            ? 'bg-blue-50 border border-blue-200 shadow-sm'
            : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
          }`}
      >
        {/* Checkbox */}
        <div className="flex-shrink-0">
          <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 group-hover:border-gray-400'
            }`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`font-medium text-sm leading-5 ${isLinked ? 'text-green-700' : isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}>
              {truncatedName}
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {product.orderDate && (
              <span className="font-medium">
                {new Date(product.orderDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            {product.paid && <span className="font-mono">• Paid: ${product.paid.toFixed(2)}</span>}
            {product.received && <span className="font-mono text-green-600">• Received: ${product.received.toFixed(2)}</span>}
          </div>
        </div>
      </li>
    );
  };

  // UI Helper functions
  const buttonClassName = useMemo(() => {
    const base = "w-full min-w-48 max-w-96 px-4 py-3 transition-all duration-200 flex items-center justify-between rounded-lg border";
    return disabled
      ? `${base} bg-gray-50 border-gray-200 cursor-not-allowed opacity-60`
      : `${base} bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;
  }, [disabled]);

  const displayText = useMemo(() => {
    if (selectedProducts.length === 0) {
      return (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Link Products</span>
        </div>
      );
    }

    if (selectedProducts.length === 1) {
      const product = selectedProducts[0];
      const truncatedName = product.item.length > 28
        ? `${product.item.substring(0, 28)}...`
        : product.item;

      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
          <span className="font-medium">{truncatedName}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
        <span className="font-medium">{selectedProducts.length} Products Linked</span>
      </div>
    );
  }, [selectedProducts]);

  // Modal components
  const ModalHeader = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Link Products to PayPal Transaction
      </h3>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by product name, amount, or order date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  const modalBody = (
    <div className="relative">
      {/* Modern Products List */}
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {(unlinkedProducts.length > 0 || linkedProducts.length > 0) ? (
          <div className="space-y-1">
            {/* Available Products Section */}
            {unlinkedProducts.length > 0 && (
              <div>
                <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-medium text-gray-900">
                      Available Products ({unlinkedProducts.length})
                    </h4>
                  </div>
                </div>
                <ul role="list" className="space-y-1 pb-4">
                  {unlinkedProducts.map((product) => <ProductItem key={product.id} product={product} isLinked={false} />)}
                </ul>
              </div>
            )}

            {/* Already Linked Products Section */}
            {linkedProducts.length > 0 && (
              <div>
                <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10 px-4 py-3 border-b border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium text-green-800">
                      Already Linked Products ({linkedProducts.length})
                    </h4>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Previously linked
                    </span>
                  </div>
                </div>
                <ul role="list" className="space-y-1 pb-4">
                  {linkedProducts.map((product) => <ProductItem key={product.id} product={product} isLinked={true} />)}
                </ul>
              </div>
            )}
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-sm">
              No products match "<span className="font-medium">{searchTerm}</span>". Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-500 max-w-sm">
              Add some products first to link them to your PayPal transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const ModalFooter = () => {
    const linkButtonLabel = tempSelectedProductIds.length > 0
      ? `Link ${tempSelectedProductIds.length} Product${tempSelectedProductIds.length !== 1 ? 's' : ''}`
      : 'Link Products';

    return (
      <form onSubmit={handleSave} className="flex gap-3">
        {tempSelectedProductIds.length > 0 && (
          <Button
            variant="danger"
            label="Clear All"
            onClick={handleClearAll}
            className="flex-1"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          />
        )}
        <Button variant="secondary" label="Cancel" onClick={closeModal} className="flex-1" />
        <Button
          variant="primary"
          label={linkButtonLabel}
          className="flex-1"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />
      </form>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={openModal}
        disabled={disabled}
        className={buttonClassName}
      >
        <div className={`flex-1 text-left ${selectedProducts.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
          {displayText}
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
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
        onClose={closeModal}
        header={<ModalHeader />}
        body={modalBody}
        footer={<ModalFooter />}
        size="md"
      />
    </>
  );
};
