import React, { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof PayPalTransaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = !searchTerm || 
        transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.itemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || transaction.status === statusFilter;
      const matchesType = !typeFilter || transaction.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      // First priority: Unlinked transactions at the top
      const aLinked = !!a.linkedProductId;
      const bLinked = !!b.linkedProductId;
      
      if (aLinked !== bLinked) {
        return aLinked ? 1 : -1; // Unlinked (false) comes first
      }

      // Second priority: Sort by the selected field
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);

  const handleSort = (field: keyof PayPalTransaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reversed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const uniqueStatuses = [...new Set(transactions.map(t => t.status))];
  const uniqueTypes = [...new Set(transactions.map(t => t.type))];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 className="text-xl font-bold text-white">PayPal Transactions</h2>
        <p className="text-blue-100">
          Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search name, transaction ID, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Date/Time {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fees')}
              >
                Fees {sortField === 'fees' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                Net {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Link
              </th>
              {onDeleteTransaction && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedTransactions.map((transaction) => (
              <tr 
                key={transaction.id} 
                className={`hover:bg-gray-50 ${
                  !transaction.linkedProductId 
                    ? 'bg-orange-50 border-l-4 border-orange-400' 
                    : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{transaction.date}</div>
                    <div className="text-gray-500">{transaction.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{transaction.name}</div>
                    {transaction.itemTitle && (
                      <div className="text-gray-500 text-xs truncate max-w-xs">
                        {transaction.itemTitle}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  {formatCurrency(transaction.fees)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                  <span className={transaction.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.total)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {transaction.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {!transaction.linkedProductId && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No mapping available</span>
                    )}
                  </div>
                </td>
                {onDeleteTransaction && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={async () => {
                        if (transaction.id && confirm('Are you sure you want to delete this transaction?')) {
                          await onDeleteTransaction(transaction.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedTransactions.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            {transactions.length === 0 
              ? 'Import your first PayPal CSV file to get started'
              : 'Try adjusting your filters to see more transactions'
            }
          </p>
        </div>
      )}
    </div>
  );
};
