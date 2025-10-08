import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';
import { Modal, Button, ProductThumbnail } from './common';
import { getProductStatus, isVoid, isRefundPending } from '../utils/productStatus';
import { formatCurrency } from '../utils/currency';
import { colors } from '../utils/colors';

interface ProductLinkModalProps {
  products: Product[];
  selectedProductIds: string[];
  onProductSelect: (productIds: string[]) => void;
  linkedProductIds?: string[];
  transaction?: PayPalTransaction;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductLinkModal: React.FC<ProductLinkModalProps> = ({
  products,
  selectedProductIds,
  onProductSelect,
  linkedProductIds = [],
  transaction,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedProductIds, setTempSelectedProductIds] = useState<string[]>(selectedProductIds);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Accordion state for Available Products section
  const [availableAccordionState, setAvailableAccordionState] = useState({
    'refundPending': true,   // Expanded by default
    'void': false,            // Collapsed by default
    'others': false           // Collapsed by default
  });



  // Toggle accordion section
  const toggleAvailableAccordion = (section: keyof typeof availableAccordionState) => {
    setAvailableAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Categorize products by status for available products only
  const categorizeAvailableProducts = (products: Product[]) => {
    const refundPending: Product[] = [];
    const others: Product[] = [];
    const voidProducts: Product[] = [];

    products.forEach(product => {
      
      if (isRefundPending(product)) {
        refundPending.push(product);
      } else if (isVoid(product)) {
        voidProducts.push(product);
      } else {
        others.push(product);
      }
    });

    return {
      'refundPending': refundPending,
      'void': voidProducts,
      'others': others
    };
  };

  // Memoized computations for better performance
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
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Event handlers
  const handleProductToggle = (productId: string) => {
    setTempSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleClearAll = () => setTempSelectedProductIds([]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onProductSelect(tempSelectedProductIds);
    closeModal();
  };

  const closeModal = () => {
    setSearchTerm('');
    setTempSelectedProductIds(selectedProductIds);
    onClose();
  };

  // Accordion Section Component for Available Products
  const AccordionSection = ({ 
    title, 
    count, 
    isExpanded, 
    onToggle, 
    products, 
    statusType = 'others'
  }: {
    title: string;
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
    products: Product[];
    statusType?: 'refund-pending' | 'void' | 'others';
  }) => {
    // Map statusType to accordion color scheme using colors.ts
    const getAccordionColors = (type: string) => {
      switch (type) {
        case 'refund-pending':
          return {
            bg: 'bg-blue-50',
            text: 'text-blue-900', 
            border: 'border-blue-200'
          };
        case 'void':
          return {
            bg: 'bg-gray-50',
            text: 'text-gray-900',
            border: 'border-gray-200'
          };
        case 'others':
        default:
          return {
            bg: 'bg-green-50',
            text: 'text-green-900',
            border: 'border-green-200'
          };
      }
    };

    const colorClasses = getAccordionColors(statusType);

    return (
      <div className="mb-2">
        <button
          onClick={onToggle}
          className={`w-full px-4 py-3 ${colorClasses.bg} ${colorClasses.text} border-b ${colorClasses.border} hover:opacity-80 transition-opacity`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-left">
                <h4 className="font-medium">
                  {title} ({count})
                </h4>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        {isExpanded && (
          <div className={`${colors.background.primary}`}>
            <ul role="list" className="space-y-1 p-2">
              {products.map((product) => (
                <ProductItem key={product.id} product={product} isLinked={false} />
              ))}
            </ul>
          </div>
        )}
      </div>
    );
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

        {/* Thumbnail */}
        <ProductThumbnail 
          imageUrl={product.imageUrl}
          productName={product.item}
          size="sm"
        />

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
            {product.paid && <span className="font-mono">• Paid: {formatCurrency(product.paid)}</span>}
            {product.received && <span className="font-mono text-green-600">• Received: {formatCurrency(product.received)}</span>}
          </div>
        </div>
      </li>
    );
  };

  // Update temp selection when props change
  useEffect(() => {
    setTempSelectedProductIds(selectedProductIds);
  }, [selectedProductIds]);



  // Modal components
  const ModalHeader = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Link Products
        </h3>
        {transaction && (
          <p className="text-sm text-gray-600 mt-2">
            Net Received: <span className="font-semibold text-green-600">{formatCurrency(transaction.total)}</span>
          </p>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          key="product-search-input"
          ref={inputRef}
          type="text"
          placeholder="Search by product name, amount, or order date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          autoComplete="off"
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
  ), [searchTerm, transaction]);

  const modalBody = (
    <div className="relative">
      {/* Modern Products List */}
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {(unlinkedProducts.length > 0 || linkedProducts.length > 0) ? (
          <div className="space-y-1">
            {/* Available Products Section with Accordion */}
            {unlinkedProducts.length > 0 && (() => {
              const categorizedProducts = categorizeAvailableProducts(unlinkedProducts);
              return (
                <div>
                  <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="font-medium text-gray-900">
                        Available Products ({unlinkedProducts.length})
                      </h4>
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <AccordionSection
                      title="Refund Pending"
                      count={categorizedProducts['refundPending'].length}
                      isExpanded={availableAccordionState['refundPending']}
                      onToggle={() => toggleAvailableAccordion('refundPending')}
                      products={categorizedProducts['refundPending']}
                      statusType="refund-pending"
                    />
                    <AccordionSection
                      title="Active status"
                      count={categorizedProducts['others'].length}
                      isExpanded={availableAccordionState.others}
                      onToggle={() => toggleAvailableAccordion('others')}
                      products={categorizedProducts['others']}
                      statusType="others"
                    />
                    <AccordionSection
                      title="Void"
                      count={categorizedProducts['void'].length}
                      isExpanded={availableAccordionState['void']}
                      onToggle={() => toggleAvailableAccordion('void')}
                      products={categorizedProducts['void']}
                      statusType="void"
                    />
                  </div>
                </div>
              );
            })()}

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
          type="submit"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l-1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />
      </form>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      header={ModalHeader}
      body={modalBody}
      footer={<ModalFooter />}
      size="md"
    />
  );
};

export default ProductLinkModal;
