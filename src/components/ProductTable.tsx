import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import EditProductModal from './EditProductModal';
import { getProductStatus } from '../utils/productStatus';
import { useProductPayPalLinks } from '../hooks/useProductPayPalLinks';

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
  userId
}) => {
  console.log('ProductTable received products:', products);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Get product IDs for checking PayPal links
  const productIds = products.map(p => p.id).filter(Boolean) as string[];
  const { isProductLinked } = useProductPayPalLinks(userId, productIds);

  const handleEditProduct = (product: Product) => {
    console.log('handleEditProduct called with:', product);
    setEditingProduct(product);
    setIsModalOpen(true);
    setShowDropdown(null);
    console.log('Modal state set: isModalOpen=true, editingProduct=', product);
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
    if (delta === null) return 'text-gray-500';
    if (delta > 0) return 'text-green-600';
    if (delta < 0) return 'text-red-600';
    return 'text-gray-500';
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
      <div className="text-center py-16 text-gray-500">
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
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-lg text-blue-600 hover:text-blue-800 underline mb-1 block"
                    >
                      {product.item.length > 150 ? `${product.item.substring(0, 150)}...` : product.item}
                    </a>
                  ) : (
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.item.length > 150 ? `${product.item.substring(0, 150)}...` : product.item}</h3>
                  )}
                  <p className="text-sm text-gray-600">Order Date: {formatDate(product.orderDate)}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.color}`}>
                    {status.label}
                  </span>
                  {product.id && isProductLinked(product.id) && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-800">
                      Linked
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div className="border-t pt-3 mb-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Paid</p>
                    <p className="font-mono font-semibold">{formatCurrency(product.paid)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Received</p>
                    <p className="font-mono font-semibold">{formatCurrency(product.received)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Delta</p>
                    <p className={`font-mono font-semibold ${getDeltaClass(product.delta)}`}>
                      {formatCurrency(product.delta)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end relative dropdown-container">
                <button
                        onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                        className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto max-h-[93vh] overflow-y-auto border border-gray-200 rounded-xl">
          <table className="w-full bg-white shadow-md">
            <thead className="gradient-bg sticky top-0 z-5 shadow-sm">
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
                    Actions
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
                        {product.item.length > 40 ? `${product.item.substring(0, 40)}...` : product.item}
                      </a>
                    ) : (
                      <strong>{product.item.length > 40 ? `${product.item.substring(0, 40)}...` : product.item}</strong>
                    )}
                    {product.id && isProductLinked(product.id) && (
                      <span className="inline-block rounded-full text-center text-xs font-semibold tracking-wider text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
                        className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-gray-400"
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
      {console.log('Rendering modal section - isModalOpen:', isModalOpen, 'editingProduct:', editingProduct)}
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
