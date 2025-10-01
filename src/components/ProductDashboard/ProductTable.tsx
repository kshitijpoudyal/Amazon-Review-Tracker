import React, { useState, useEffect } from 'react';
import { Product } from '../../types/Product';
import EditProductModal from './EditProductModal';
import { getProductStatus } from '../../utils/productStatus';
import { useProductPayPalLinks } from '../../hooks/useProductPayPalLinks';
import { TableView, TableColumn, TableRow, MobileCardContent } from '../common/TableView';
import { colors, getBadgeClasses } from '../../utils/colors';

interface ProductTableProps {
  products: Product[];
  onUpdateProduct?: (index: number, updatedProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  readOnly?: boolean;
  loading?: boolean;
  userId?: string; // Add userId to check for linked PayPal transactions
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onUpdateProduct,
  onDeleteProduct,
  readOnly = false,
  loading = false,
  userId,
}) => {
  const [showDropdown, setShowDropdown] = useState<string | number | null>(null);
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

  // Define table columns
  const columns: TableColumn[] = [
    { 
      key: 'item', 
      label: `Item (${products.length})`,
      align: 'left'
    },
    { 
      key: 'date', 
      label: 'Date',
      align: 'left'
    },
    { 
      key: 'status', 
      label: 'Status',
      align: 'left'
    },
    { 
      key: 'paid', 
      label: 'Paid',
      align: 'right'
    },
    { 
      key: 'received', 
      label: 'Received',
      align: 'right'
    },
    { 
      key: 'delta', 
      label: 'Delta',
      align: 'right'
    },
    ...(readOnly ? [] : [{ 
      key: 'actions', 
      label: 'Actions',
      align: 'center' as const,
      width: 'w-16'
    }])
  ];

  // Transform products into table rows
  const rows: TableRow[] = products.map((product, index) => {
    const status = getProductStatus(product);
    const isLinked = product.id && isProductLinked(product.id);

    return {
      id: product.id || index,
      borderColor: colors.status[status.type].border,
      data: {
        item: (
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              {product.url ? (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
                  title={product.item}
                >
                  {product.item.length > 80 ? `${product.item.substring(0, 80)}...` : product.item}
                </a>
              ) : (
                <span className="font-medium text-gray-900 truncate" title={product.item}>
                  {product.item.length > 80 ? `${product.item.substring(0, 80)}...` : product.item}
                </span>
              )}
              {isLinked && (
                <svg className="w-5 h-5 text-green-500 ml-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ),
        date: (
          <span className="text-sm text-gray-600 font-medium">
            {formatDate(product.orderDate)}
          </span>
        ),
        status: (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.status[status.type].bg} ${colors.status[status.type].text} ${colors.status[status.type].border}`}>
            {status.label}
          </span>
        ),
        paid: (
          <span className="font-mono text-sm font-semibold text-gray-900">
            {formatCurrency(product.paid)}
          </span>
        ),
        received: (
          <span className="font-mono text-sm font-semibold text-gray-900">
            {formatCurrency(product.received)}
          </span>
        ),
        delta: (
          <span className={`font-mono text-sm font-semibold ${getDeltaClass(product.delta)}`}>
            {formatCurrency(product.delta)}
          </span>
        ),
        actions: null // Will be handled by the actions array below
      },
      actions: readOnly ? [] : [
        {
          label: 'Edit Product',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          onClick: () => handleEditProduct(product)
        },
        {
          label: 'Delete Product',
          variant: 'danger' as const,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          onClick: () => {
            if (product.id && window.confirm('Are you sure you want to delete this product?')) {
              onDeleteProduct?.(product.id);
            }
          }
        }
      ]
    };
  });

  // Mobile cards data
  const mobileCards: MobileCardContent[] = products.map((product, index) => {
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
          <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[120px]">
            <button
              onClick={() => handleEditProduct(product)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
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
              className={`block w-full text-left px-4 py-2 text-sm ${colors.modal.danger} rounded-b-lg transition-colors`}
            >
              Delete
            </button>
          </div>
        )}
      </>
    );

    return {
      headerContent,
      financialContent,
      actionsContent,
      borderColor: colors.status[status.type].border,
      className: product.id && isProductLinked(product.id) ? 'bg-green-50' : ''
    };
  });

  return (
    <>
      <TableView
        columns={columns}
        rows={rows}
        mobileCards={mobileCards}
        emptyMessage="No products found matching your criteria."
        activeDropdown={showDropdown}
        loading={loading}
        onDropdownToggle={(rowId) => setShowDropdown(prev => prev === rowId ? null : rowId)}
      />

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
