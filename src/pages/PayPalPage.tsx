import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGenericFilters } from '../hooks/useGenericFilters';
import { useDashboardState } from '../hooks/useDashboardState';
import { usePayPalTransactions } from '../hooks/usePayPalTransactions';
import { useProductCrudFirebase } from '../hooks/useProductCrudFirebase';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { PayPalTransactionTable } from '../components/PaypalDashboard/PayPalTransactionTable';
import { AddPayPalTransactionForm } from '../components/PaypalDashboard/AddPayPalTransactionForm';
import { 
  DashboardLayout, 
  DashboardStats, 
  DashboardError, 
  DashboardSection,
  FilterControlConfig
} from '../components/common';
import Toolbar from '../components/common/Toolbar';
import { TableViewLoading } from '../components/common/TableViewLoading';
import { getStatsColor } from '../utils/colors';

/**
 * PayPalPage Component
 * 
 * Dashboard for managing PayPal transactions and linking them to products.
 * Features:
 * - Transaction listing with filtering and search
 * - Product linking with multiple products per transaction
 * - Import transactions from CSV
 * - Statistical overview of transactions
 * - Equal amount distribution across linked products
 */
export const PayPalPage: React.FC = () => {
  const { user } = useAuth();
  const { showAddForm, handleShowAddForm, handleHideAddForm } = useDashboardState();
  
  // Filter state management
  const { 
    updateFilter, 
    clearFilters: clearAllFilters,
    getFilterValue 
  } = useGenericFilters({
    initialFilters: {
      searchTerm: '',
      typeFilter: '',
      linkFilter: ''
    }
  });

  // Extract filter values
  const searchTerm = getFilterValue('searchTerm');
  const typeFilter = getFilterValue('typeFilter');
  const linkFilter = getFilterValue('linkFilter');
  const {
    data,
    loading,
    error,
    importTransactions,
    addTransaction,
    deleteTransaction,
    updateProductLink,
    refetch
  } = usePayPalTransactions(user?.uid);

  // Fetch products for mapping
  const { data: productData, loading: productsLoading } = useProductCrudFirebase(user?.uid);

  // Enforce minimum loading time of 3 seconds for main transactions
  const displayLoading = useMinimumLoading(loading);
  
  // Enforce minimum loading time for products loading as well
  const displayProductsLoading = useMinimumLoading(productsLoading, 0);

  // Filter transactions based on current filter values
  const filteredTransactions = data?.transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.itemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || transaction.type === typeFilter;
    
    const matchesLinkFilter = !linkFilter || 
      (linkFilter === 'linked' && transaction.linkedProductId) ||
      (linkFilter === 'unlinked' && !transaction.linkedProductId);

    return matchesSearch && matchesType && matchesLinkFilter;
  }) || [];

  // Configure filter controls
  const filterConfigs: FilterControlConfig[] = [
    {
      type: 'search',
      key: 'searchTerm',
      placeholder: 'Search transactions...',
      value: searchTerm,
      onChange: (value) => updateFilter('searchTerm', value)
    },
    {
      type: 'select',
      key: 'linkFilter',
      value: linkFilter,
      onChange: (value) => updateFilter('linkFilter', value),
      options: [
        { value: '', label: 'All Transactions' },
        { value: 'linked', label: 'Linked to Products' },
        { value: 'unlinked', label: 'Unlinked' }
      ]
    }
  ];

  const handleImport = async (transactions: any[]) => {
    const result = await importTransactions(transactions);
    
    // Show detailed import results including withdrawal skips
    if (result.withdrawalSkipped > 0) {
      // Import completed with some withdrawals skipped
    }
    
    return result;
  };

  const handleAddTransaction = async (transaction: any) => {
    const success = await addTransaction(transaction);
    if (success) {
      await refetch();
      handleHideAddForm();
    }
    return success;
  };

  const handleUpdateProductLink = async (transactionId: string, productId: string | null) => {
    const success = await updateProductLink(transactionId, productId);
    if (success) {
      await refetch();
    }
    return success;
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const success = await deleteTransaction(transactionId);
    if (success) {
      await refetch();
    }
    return success;
  };

  // Calculate unlinked transactions from filtered data
  const unlinkedTransactionsCount = filteredTransactions.filter(
    transaction => !transaction.linkedProductId
  ).length;

  // Calculate total amount of unlinked transactions from filtered data
  const unlinkedTransactionsAmount = filteredTransactions
    .filter(transaction => !transaction.linkedProductId)
    .reduce((total, transaction) => total + transaction.total, 0);

  // Prepare stats data
  const statsData = data ? [
    {
      value: `$${data.summary.totalIncome.toFixed(2)}`,
      label: "Total Income",
      className: getStatsColor('income')
    },
    {
      value: `$${data.summary.totalFees.toFixed(2)}`,
      label: "Total Fees",
      className: getStatsColor('fees')
    },
    {
      value: `$${data.summary.netReceivedTotal.toFixed(2)}`,
      label: "Net Received Total",
      className: getStatsColor('netReceived')
    },
    {
      value: filteredTransactions.length,
      label: "Visible Transactions",
      className: getStatsColor('transactionCount')
    },
    {
      value: unlinkedTransactionsCount,
      label: "Unlinked Count",
      className: getStatsColor('unlinkedCount')
    },
    {
      value: `$${unlinkedTransactionsAmount.toFixed(2)}`,
      label: "Unlinked Amount",
      className: getStatsColor('unlinkedAmount')
    }
  ] : [];

  const actions = [
    {
      label: "Add Transaction",
      onClick: handleShowAddForm,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      disabled: displayLoading
    }
  ];

  return (
    <DashboardLayout>
      {/* Error Display */}
      {error && (
        <DashboardError error={error} />
      )}

      {/* Summary Cards */}
      <DashboardStats stats={statsData} loading={displayLoading} />

      {/* Filter Controls */}
      <Toolbar
        actions={actions}
        filters={filterConfigs}
        onClearFilters={clearAllFilters}
        loading={displayLoading}
        showClearButton={true}
      />

      {/* Transactions Table */}
      <DashboardSection>
        {displayLoading ? (
          <TableViewLoading />
        ) : (
          <PayPalTransactionTable
          transactions={filteredTransactions}
          products={productData?.products || []}
          loading={displayLoading}
          productsLoading={displayProductsLoading}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateProductLink={handleUpdateProductLink}
        />
        )}
      </DashboardSection>

      {/* Add Transaction Form Modal */}
      {showAddForm && (
        <AddPayPalTransactionForm
          onAddTransaction={handleAddTransaction}
          onImportTransactions={handleImport}
          onCancel={handleHideAddForm}
        />
      )}
    </DashboardLayout>
  );
};
