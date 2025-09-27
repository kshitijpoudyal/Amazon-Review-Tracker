import React, { useState, useEffect } from 'react';
import { Product } from '../../types/Product';
import EditProductModal from './EditProductModal';
import { getProductStatus } from '../../utils/productStatus';
import { useProductPayPalLinks } from '../../hooks/useProductPayPalLinks';
import { MobileItemCard } from '../common/MobileItemCard';
import { colors, getBadgeClasses } from '../../utils/colors';

interface ProductTableProps {
  products: Product[];
  onUpdateProduct?: (index: number, updatedProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  readOnly?: boolean;
  userId?: string; // Add userId to check for linked PayPal transactions
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onUpdateProduct,
  onDeleteProduct,
  readOnly = false,
  userId,
}) => {
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Get product IDs for checking PayPal links
  const productIds = products.map(p => p.id).filter(Boolean) as string[];
  const { isProductLinked } = useProductPayPalLinks(userId, productIds);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
    setShowDropdown(null);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    const productIndex = products.findIndex(p => p.id === updatedProduct.id);
    if (productIndex !== -1 && onUpdateProduct) {
      onUpdateProduct(productIndex, updatedProduct);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDeltaClass = (delta: number | null) => {
    if (delta === null) return colors.text.muted;
    if (delta > 0) return colors.financial.positive;
    if (delta < 0) return colors.financial.negative;
    return colors.text.muted;
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      // Split the date string to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  if (products.length === 0) {
    return (
      <div className={`text-center py-16 ${colors.text.muted}`}>
        <p className="text-lg">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {products.map((product, index) => {
          const status = getProductStatus(product);
          
          const headerContent = (
            <>
              {product.url ? (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-semibold text-lg ${colors.text.link} hover:${colors.text.linkHover} underline mb-1 block`}
                >
                  {product.item.length > 150 ? `${product.item.substring(0, 150)}...` : product.item}
                </a>
              ) : (
                <h3 className={`font-semibold text-lg ${colors.text.primary} mb-1`}>
                  {product.item.length > 150 ? `${product.item.substring(0, 150)}...` : product.item}
                </h3>
              )}
              <p className={`text-sm ${colors.text.secondary}`}>Order Date: {formatDate(product.orderDate)}</p>
              <div className="flex flex-col items-end space-y-1 mt-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.color}`}>
                  {status.label}
                </span>
                {product.id && isProductLinked(product.id) && (
                  <span className={getBadgeClasses('linked')}>
                    Linked
                  </span>
                )}
              </div>
            </>
          );

          const financialContent = (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <p className={`${colors.text.secondary} mb-1`}>Paid</p>
                <p className="font-mono font-semibold">{formatCurrency(product.paid)}</p>
              </div>
              <div className="text-center">
                <p className={`${colors.text.secondary} mb-1`}>Received</p>
                <p className="font-mono font-semibold">{formatCurrency(product.received)}</p>
              </div>
              <div className="text-center">
                <p className={`${colors.text.secondary} mb-1`}>Delta</p>
                <p className={`font-mono font-semibold ${getDeltaClass(product.delta)}`}>
                  {formatCurrency(product.delta)}
                </p>
              </div>
            </div>
          );

          const actionsContent = (
            <>
              <button
                onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                className={`flex items-center justify-center w-8 h-8 ${colors.button.primary} rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-gray-400`}
                title="More actions"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 3a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown === index && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (product.id && window.confirm('Are you sure you want to delete this product?')) {
                        onDeleteProduct?.(product.id);
                      }
                      setShowDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${colors.modal.danger}`}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          );

          return (
            <MobileItemCard
              key={index}
              headerContent={headerContent}
              financialContent={financialContent}
              actionsContent={actionsContent}
              className={product.id && isProductLinked(product.id) ? 'bg-green-50' : ''}
            />
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="max-h-[100vh] overflow-y-auto border border-gray-200 rounded-md scrollbar-hidden">
          <table className="w-full">
            <thead className={`${colors.background.gradient} sticky top-0 z-5 shadow-sm`}>
              <tr>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Item ({products.length})
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Received
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Delta
                </th>
                {!readOnly && (
                  <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-4 text-sm">
                    {product.url ? (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        {product.item.length > 90 ? `${product.item.substring(0, 90)}...` : product.item}
                      </a>
                    ) : (
                      <strong>{product.item.length > 70 ? `${product.item.substring(0, 70)}...` : product.item}</strong>
                    )}
                    {product.id && isProductLinked(product.id) && (
                      <span className={`inline-block rounded-full text-center text-xs font-semibold tracking-wider mx-2 ${colors.status.linked.bg} ${colors.status.linked.text}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 inline-block m-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600">
                    {formatDate(product.orderDate)}
                  </td>
                  <td className="px-3 py-4 text-sm">
                    {(() => {
                      const status = getProductStatus(product);
                      return (
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-4 text-sm font-mono font-semibold">
                    {formatCurrency(product.paid)}
                  </td>
                  <td className="px-3 py-4 text-sm font-mono font-semibold">
                    {formatCurrency(product.received)}
                  </td>
                  <td className={`px-3 py-4 text-sm font-mono font-semibold ${getDeltaClass(product.delta)}`}>
                    {formatCurrency(product.delta)}
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-4 text-sm dropdown-container">
                      <button
                        onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                        className={`flex items-center justify-center w-8 h-8 ${colors.button.primary} hover:bg-gray-300 text-gray-700 rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-gray-400`}
                        title="More actions"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 3a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {showDropdown === index && (
                        <div className="right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (product.id && window.confirm('Are you sure you want to delete this product?')) {
                                onDeleteProduct?.(product.id);
                              }
                              setShowDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <EditProductModal
          isOpen={isModalOpen}
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
};

export default ProductTable;
