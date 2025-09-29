import React, { useState, useMemo, useEffect } from 'react';
import { PayPalTransaction } from '../../types/PayPalTransaction';
import { Product } from '../../types/Product';
import { ProductDropdown } from '../ProductDropdown';
import { TableView, TableColumn, TableRow, MobileCardContent } from '../common/TableView';
import { 
  colors, 
  getFinancialColor, 
  getBadgeClasses, 
  getActionButtonClasses,
  getRowBackgroundColor 
} from '../../utils/colors';

interface PayPalTransactionTableProps {
  transactions: PayPalTransaction[];
  products: Product[];
  loading?: boolean;
  productsLoading?: boolean;
  onUpdateProductLink?: (transactionId: string, productIds: string[]) => Promise<boolean>;
  onDeleteTransaction?: (transactionId: string) => Promise<boolean>;
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
      .flatMap(t => t.linkedProductIds || [])
      .filter((id): id is string => id !== null && id !== undefined);
  }, [transactions]);

  const [showDropdown, setShowDropdown] = useState<string | number | null>(null);

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
      const aLinked = !!(a.linkedProductIds && a.linkedProductIds.length > 0);
      const bLinked = !!(b.linkedProductIds && b.linkedProductIds.length > 0);

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

  // Define table columns
  const columns: TableColumn[] = [
    { 
      key: 'datetime', 
      label: `Date/Time (${filteredAndSortedTransactions.length})`,
      align: 'left'
    },
    { 
      key: 'transactionId', 
      label: 'Transaction ID',
      align: 'left'
    },
    { 
      key: 'name', 
      label: 'Name',
      align: 'left'
    },
    { 
      key: 'status', 
      label: 'Status',
      align: 'left'
    },
    { 
      key: 'amount', 
      label: 'Amount',
      align: 'right'
    },
    { 
      key: 'fees', 
      label: 'Fees',
      align: 'right'
    },
    { 
      key: 'netReceived', 
      label: 'Net Received',
      align: 'right'
    },
    { 
      key: 'productLink', 
      label: 'Product Link',
      align: 'left'
    },
    ...(onDeleteTransaction ? [{ 
      key: 'actions', 
      label: 'Actions',
      align: 'center' as const,
      width: 'w-16'
    }] : [])
  ];

  // Transform transactions into table rows
  const rows: TableRow[] = filteredAndSortedTransactions.map((transaction, index) => {
    const isLinked = !!(transaction.linkedProductIds && transaction.linkedProductIds.length > 0);

    return {
      id: transaction.id || index,
      borderColor: isLinked ? 'border-l-green-500' : 'border-l-yellow-500',
      className: getRowBackgroundColor(isLinked),
      data: {
        datetime: (
          <div>
            <div className="font-medium">{formatDate(transaction.date)}</div>
            <div className={colors.text.muted}>{transaction.time}</div>
          </div>
        ),
        transactionId: (
          <span className={`${colors.text.muted} font-mono text-sm`}>
            {transaction.transactionId}
          </span>
        ),
        name: (
          <div>
            <div className="font-medium">{transaction.name}</div>
            {transaction.itemTitle && (
              <div className={`${colors.text.muted} text-xs truncate max-w-xs`}>
                {transaction.itemTitle}
              </div>
            )}
          </div>
        ),
        status: (
          <>
            {isLinked ? (
              <span className={getBadgeClasses('linked')}>
                {transaction.linkedProductIds!.length === 1 ? 'Linked' : `${transaction.linkedProductIds!.length} Linked`}
              </span>
            ) : (
              <span className={getBadgeClasses('unlinked')}>
                Unlinked
              </span>
            )}
          </>
        ),
        amount: (
          <span className={`font-mono font-semibold ${getFinancialColor(transaction.amount)}`}>
            {formatCurrency(transaction.amount)}
          </span>
        ),
        fees: (
          <span className={`font-mono font-semibold ${colors.financial.negative}`}>
            {formatCurrency(transaction.fees)}
          </span>
        ),
        netReceived: (
          <span className={`font-mono font-semibold ${getFinancialColor(transaction.total)}`}>
            {formatCurrency(transaction.total)}
          </span>
        ),
        productLink: (
          <div className="flex flex-col space-y-1">
            {onUpdateProductLink ? (
              <ProductDropdown
                products={products}
                selectedProductIds={transaction.linkedProductIds || []}
                onProductSelect={async (productIds: string[]) => {
                  if (transaction.id) {
                    await onUpdateProductLink(transaction.id, productIds);
                  }
                }}
                disabled={loading}
                loading={productsLoading}
                linkedProductIds={linkedProductIds}
              />
            ) : (
              <span className="text-gray-400 text-xs">No mapping available</span>
            )}
          </div>
        ),
        actions: null // Will be handled by the actions array below
      },
      actions: onDeleteTransaction ? [
        {
          label: 'Delete Transaction',
          variant: 'danger' as const,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          onClick: async () => {
            if (transaction.id && window.confirm('Are you sure you want to delete this transaction?')) {
              await onDeleteTransaction(transaction.id);
            }
          }
        }
      ] : []
    };
  });

  // Mobile cards data
  const mobileCards: MobileCardContent[] = filteredAndSortedTransactions.map((transaction, index) => {
    const isLinked = !!(transaction.linkedProductIds && transaction.linkedProductIds.length > 0);

    const headerContent = (
      <>
        <h3 className={`font-semibold text-lg ${colors.text.primary} mb-1`}>{transaction.transactionId}</h3>
        <p className={`text-sm ${colors.text.secondary}`}>
          {transaction.name} | {formatDate(transaction.date)} • {transaction.time}
        </p>
        {transaction.itemTitle && (
          <p className={`text-sm ${colors.text.muted} truncate`}>{transaction.itemTitle}</p>
        )}
        <div className="flex flex-col items-end space-y-1 mt-2">
          {isLinked ? (
            <span className={getBadgeClasses('linked')}>
              {transaction.linkedProductIds!.length === 1 ? 'Linked' : `${transaction.linkedProductIds!.length} Linked`}
            </span>
          ) : (
            <span className={getBadgeClasses('unlinked')}>
              Unlinked
            </span>
          )}
        </div>
      </>
    );

    const financialContent = (
      <>
        <div className="grid grid-cols-3 gap-3 text-sm mb-3">
          <div className="text-center">
            <p className={`${colors.text.secondary} mb-1`}>Amount</p>
            <p className={`font-mono font-semibold ${getFinancialColor(transaction.amount)}`}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="text-center">
            <p className={`${colors.text.secondary} mb-1`}>Fees</p>
            <p className={`font-mono font-semibold ${colors.financial.negative}`}>{formatCurrency(transaction.fees)}</p>
          </div>
          <div className="text-center">
            <p className={`${colors.text.secondary} mb-1`}>Net Received</p>
            <p className={`font-mono font-semibold ${getFinancialColor(transaction.total)}`}>
              {formatCurrency(transaction.total)}
            </p>
          </div>
        </div>
        
        {/* Product Link */}
        <div className="border-t pt-3">
          <p className={`text-sm ${colors.text.secondary} mb-2`}>Product Link:</p>
          {onUpdateProductLink ? (
            <ProductDropdown
              products={products}
              selectedProductIds={transaction.linkedProductIds || []}
              onProductSelect={async (productIds: string[]) => {
                if (transaction.id) {
                  await onUpdateProductLink(transaction.id, productIds);
                }
              }}
              disabled={loading}
              loading={productsLoading}
              linkedProductIds={linkedProductIds}
            />
          ) : (
            <span className={`${colors.text.disabled} text-xs`}>No mapping available</span>
          )}
        </div>
      </>
    );

    const actionsContent = onDeleteTransaction ? (
      <>
        <button
          onClick={() => setShowDropdown(showDropdown === index ? null : index)}
          className={getActionButtonClasses()}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown === index && (
          <div className={`absolute right-0 top-10 ${colors.background.primary} ${colors.border.default} rounded-md shadow-lg z-10`}>
            <button
              onClick={async () => {
                if (transaction.id && window.confirm('Are you sure you want to delete this transaction?')) {
                  await onDeleteTransaction(transaction.id);
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
    ) : null;

    return {
      headerContent,
      financialContent,
      actionsContent,
      borderColor: isLinked ? 'border-l-green-500' : 'border-l-yellow-500',
      className: isLinked ? 'bg-green-50' : 'bg-orange-50'
    };
  });

  return (
    <TableView
      columns={columns}
      rows={rows}
      mobileCards={mobileCards}
      emptyMessage="No PayPal transactions found."
      loading={loading}
      activeDropdown={showDropdown}
      onDropdownToggle={(rowId) => setShowDropdown(prev => prev === rowId ? null : rowId as number)}
    />
  );
};
