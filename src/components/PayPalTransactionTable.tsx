import React, { useState, useMemo, useEffect } from 'react';
import { PayPalTransaction } from '../types/PayPalTransaction';
import { Product } from '../types/Product';
import { ProductDropdown } from './ProductDropdown';

interface PayPalTransactionTableProps {
  transactions: PayPalTransaction[];
  products?: Product[];
  loading?: boolean;
  productsLoading?: boolean;
  onDeleteTransaction?: (transactionId: string) => Promise<boolean>;
  onUpdateProductLink?: (transactionId: string, productId: string | null) => Promise<boolean>;
}

export const PayPalTransactionTable: React.FC<PayPalTransactionTableProps> = ({
  transactions,
  products = [],
  loading = false,
  productsLoading = false,
  onDeleteTransaction,
  onUpdateProductLink
}) => {
  
  // Calculate which product IDs are already linked to transactions
  const linkedProductIds = useMemo(() => {
    return transactions
      .map(t => t.linkedProductId)
      .filter((id): id is string => id !== null && id !== undefined);
  }, [transactions]);

  const [showDropdown, setShowDropdown] = useState<number | null>(null);

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

  const filteredAndSortedTransactions = useMemo(() => {
    // Sort transactions with unlinked ones first
    return [...transactions].sort((a, b) => {
      const aLinked = !!a.linkedProductId;
      const bLinked = !!b.linkedProductId;
      
      if (aLinked !== bLinked) {
        return aLinked ? 1 : -1; // Unlinked (false) comes first
      }

      // Sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No PayPal transactions found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {filteredAndSortedTransactions.map((transaction, index) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{transaction.name}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(transaction.date)} • {transaction.time}
                </p>
                {transaction.itemTitle && (
                  <p className="text-sm text-gray-500 truncate">{transaction.itemTitle}</p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {transaction.type}
                </span>
                {!transaction.linkedProductId && (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-100 text-orange-800">
                    Unlinked
                  </span>
                )}
              </div>
            </div>

            {/* Financial Info */}
            <div className="border-t pt-3 mb-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Amount</p>
                  <p className={`font-mono font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Fees</p>
                  <p className="font-mono font-semibold text-red-600">{formatCurrency(transaction.fees)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Net Received</p>
                  <p className={`font-mono font-semibold ${transaction.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Link */}
            <div className="border-t pt-3 mb-3">
              <p className="text-sm text-gray-600 mb-2">Product Link:</p>
              {onUpdateProductLink ? (
                <ProductDropdown
                  products={products}
                  selectedProductId={transaction.linkedProductId || null}
                  onProductSelect={async (productId: string | null) => {
                    if (transaction.id) {
                      await onUpdateProductLink(transaction.id, productId);
                    }
                  }}
                  disabled={loading}
                  size="small"
                  loading={productsLoading}
                  linkedProductIds={linkedProductIds}
                />
              ) : (
                <span className="text-gray-400 text-xs">No mapping available</span>
              )}
            </div>

            {/* Transaction ID */}
            <div className="border-t pt-3 mb-3">
              <p className="text-sm text-gray-600 mb-1">Transaction ID:</p>
              <p className="text-xs font-mono text-gray-700">{transaction.transactionId}</p>
            </div>

            {/* Actions */}
            {onDeleteTransaction && (
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
                      onClick={async () => {
                        if (transaction.id && window.confirm('Are you sure you want to delete this transaction?')) {
                          await onDeleteTransaction(transaction.id);
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
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto max-h-[93vh] overflow-y-auto border border-gray-200 rounded-xl">
          <table className="w-full bg-white shadow-md">
            <thead className="gradient-bg sticky top-0 z-5 shadow-sm">
              <tr>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Date/Time ({filteredAndSortedTransactions.length})
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Fees
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Net Received
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                  Product Link
                </th>
                {onDeleteTransaction && (
                  <th className="px-3 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTransactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    !transaction.linkedProductId ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-3 py-4 text-sm">
                    <div>
                      <div className="font-medium">{formatDate(transaction.date)}</div>
                      <div className="text-gray-500">{transaction.time}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{transaction.name}</div>
                      {transaction.itemTitle && (
                        <div className="text-gray-500 text-xs truncate max-w-xs">
                          {transaction.itemTitle}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <span className="inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider bg-blue-100 text-blue-800">
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm font-mono font-semibold">
                    <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm font-mono font-semibold text-red-600">
                    {formatCurrency(transaction.fees)}
                  </td>
                  <td className="px-3 py-4 text-sm font-mono font-semibold">
                    <span className={transaction.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(transaction.total)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 font-mono">
                    {transaction.transactionId}
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <div className="flex flex-col space-y-1">
                      {!transaction.linkedProductId && (
                        <span className="inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider bg-orange-100 text-orange-800">
                          Unlinked
                        </span>
                      )}
                      {onUpdateProductLink ? (
                        <ProductDropdown
                          products={products}
                          selectedProductId={transaction.linkedProductId || null}
                          onProductSelect={async (productId: string | null) => {
                            if (transaction.id) {
                              await onUpdateProductLink(transaction.id, productId);
                            }
                          }}
                          disabled={loading}
                          size="small"
                          loading={productsLoading}
                          linkedProductIds={linkedProductIds}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No mapping available</span>
                      )}
                    </div>
                  </td>
                  {onDeleteTransaction && (
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
                            onClick={async () => {
                              if (transaction.id && window.confirm('Are you sure you want to delete this transaction?')) {
                                await onDeleteTransaction(transaction.id);
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
    </>
  );
};
