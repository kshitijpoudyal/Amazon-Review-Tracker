import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import EditProductModal from './EditProductModal';

interface ProductTableProps {
  products: Product[];
  onUpdateProduct: (index: number, updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onUpdateProduct, onDeleteProduct }) => {
  console.log('ProductTable received products:', products);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    console.log('handleEditProduct called with:', product);
    setEditingProduct(product);
    setIsModalOpen(true);
    setShowDropdown(null);
    console.log('Modal state set: isModalOpen=true, editingProduct=', product);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    const productIndex = products.findIndex(p => p.id === updatedProduct.id);
    if (productIndex !== -1) {
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

  const getProductStatus = (product: Product) => {
    // Void: When product is marked as void
    if (product.isVoid) {
      return { label: 'Void', color: 'bg-gray-100 text-gray-800' };
    }

    // Helper function to check if financial data is complete
    const hasFinancialData = product.paid !== null && product.received !== null;
    const hasPaidAmount = product.paid !== null;
    const hasReceivedAmount = product.received !== null;

    // Helper function to check workflow completion
    const workflowSteps = {
      ordered: product.orderPlaced,
      delivered: product.orderDelivered,
      reviewAdded: product.reviewAdded,
      reviewLive: product.reviewLive,
      screenshotSent: product.reviewSSSent
    };

    // Complete: All workflow steps and financial data complete
    if (Object.values(workflowSteps).every(Boolean) && hasFinancialData) {
      return { label: 'Complete', color: 'bg-green-100 text-green-800' };
    }

    // Refund Pending: Screenshot sent but no refund received yet
    if (workflowSteps.screenshotSent && hasPaidAmount && !hasReceivedAmount) {
      return { label: 'Refund Pending', color: 'bg-blue-100 text-blue-800' };
    }

    // Send Screenshot: Review is live but screenshot not sent yet
    if (workflowSteps.reviewLive && !workflowSteps.screenshotSent && hasPaidAmount) {
      return { label: 'Send Screenshot', color: 'bg-indigo-100 text-indigo-800' };
    }

    // Review Pending: Review added but not live yet
    if (workflowSteps.reviewAdded && !workflowSteps.reviewLive && hasPaidAmount) {
      return { label: 'Review Pending', color: 'bg-yellow-100 text-yellow-800' };
    }

    // Review Not Added: Order delivered but review not added yet
    if (workflowSteps.delivered && !workflowSteps.reviewAdded && hasPaidAmount) {
      return { label: 'Review Not Added', color: 'bg-orange-100 text-orange-800' };
    }

    // Order Placed: Order placed but not delivered yet
    if (workflowSteps.ordered && !workflowSteps.delivered && hasPaidAmount) {
      return { label: 'Order Placed', color: 'bg-purple-100 text-purple-800' };
    }

    // Not Started: No workflow progress
    if (!workflowSteps.ordered) {
      return { label: 'Not Started', color: 'bg-gray-100 text-gray-800' };
    }
    
    // Fallback for edge cases
    return { label: 'Status Unknown', color: 'bg-gray-100 text-gray-800' };
  };

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
                      {product.item}
                    </a>
                  ) : (
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.item}</h3>
                  )}
                  <p className="text-sm text-gray-600">Order Date: {formatDate(product.orderDate)}</p>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.color} ml-2`}>
                  {status.label}
                </span>
              </div>

              {/* Status Grid - Hidden, keeping only financial info visible */}
              {/* <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Placed:</span>
                  {getStatusBadge(product.orderPlaced)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered:</span>
                  {getStatusBadge(product.orderDelivered)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Review Added:</span>
                  {getStatusBadge(product.reviewAdded)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Review Live:</span>
                  {getStatusBadge(product.reviewLive)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SS Sent:</span>
                  {getStatusBadge(product.reviewSSSent)}
                </div>
              </div> */}

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
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
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
                          onDeleteProduct(product.id);
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
              {/* Hidden columns */}
              {/* <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Order Placed
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Order Delivered
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Review Added
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Review Live
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Screenshot Sent
              </th> */}
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Paid
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Received
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Delta
              </th>
              <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-4 text-sm">
                  {product.url ? (
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:text-blue-800 underline"
                    >
                      {product.item}
                    </a>
                  ) : (
                    <strong>{product.item}</strong>
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-600">
                  {formatDate(product.orderDate)}
                </td>
                <td className="px-3 py-4 text-sm">
                  {(() => {
                    const status = getProductStatus(product);
                    return (
                      <span className={`inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                    );
                  })()}
                </td>
                {/* Hidden columns */}
                {/* <td className="px-3 py-4 text-sm">
                  {getStatusBadge(product.orderPlaced)}
                </td>
                <td className="px-3 py-4 text-sm">
                  {getStatusBadge(product.orderDelivered)}
                </td>
                <td className="px-3 py-4 text-sm">
                  {getStatusBadge(product.reviewAdded)}
                </td>
                <td className="px-3 py-4 text-sm">
                  {getStatusBadge(product.reviewLive)}
                </td>
                <td className="px-3 py-4 text-sm">
                  {getStatusBadge(product.reviewSSSent)}
                </td> */}
                <td className="px-3 py-4 text-sm font-mono font-semibold">
                  {formatCurrency(product.paid)}
                </td>
                <td className="px-3 py-4 text-sm font-mono font-semibold">
                  {formatCurrency(product.received)}
                </td>
                <td className={`px-3 py-4 text-sm font-mono font-semibold ${getDeltaClass(product.delta)}`}>
                  {formatCurrency(product.delta)}
                </td>
                <td className="px-3 py-4 text-sm relative dropdown-container">
                  <button
                    onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                    title="More actions"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showDropdown === index && (
                    <div className="absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (product.id && window.confirm('Are you sure you want to delete this product?')) {
                            onDeleteProduct(product.id);
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
