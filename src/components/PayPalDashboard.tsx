import React from 'react';
import { User } from 'firebase/auth';
import { useGenericFilters } from '../hooks/useGenericFilters';
import { useDashboardState } from '../hooks/useDashboardState';
import { usePayPalTransactions } from '../hooks/usePayPalTransactions';
import { useProductCrudFirebase } from '../hooks/useProductCrudFirebase';
import { PayPalTransactionTable } from './PayPalTransactionTable';
import { AddPayPalTransactionForm } from './AddPayPalTransactionForm';
import { 
  DashboardLayout, 
  DashboardStats, 
  DashboardError, 
  DashboardSection,
  FilterControlConfig
} from './common';
import Toolbar from './common/Toolbar';
import { TableViewLoading } from './common/TableViewLoading';

interface PayPalDashboardProps {
  user?: User;
}

export const PayPalDashboard: React.FC<PayPalDashboardProps> = ({ user: propUser }) => {
  const user = propUser;
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

  // Get unique transaction types for filter dropdown
  const uniqueTypes = [...new Set(data?.transactions.map(t => t.type) || [])];

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
      key: 'typeFilter',
      value: typeFilter,
      onChange: (value) => updateFilter('typeFilter', value),
      options: [
        { value: '', label: 'All Types' },
        ...uniqueTypes.map(type => ({ value: type, label: type }))
      ]
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
      className: "text-green-600"
    },
    {
      value: `$${data.summary.totalFees.toFixed(2)}`,
      label: "Total Fees",
      className: "text-red-600"
    },
    {
      value: `$${data.summary.netReceivedTotal.toFixed(2)}`,
      label: "Net Received Total",
      className: "text-blue-600"
    },
    {
      value: filteredTransactions.length,
      label: "Visible Transactions",
      className: "text-purple-600"
    },
    {
      value: unlinkedTransactionsCount,
      label: "Unlinked Count",
      className: "text-orange-600"
    },
    {
      value: `$${unlinkedTransactionsAmount.toFixed(2)}`,
      label: "Unlinked Amount",
      className: "text-orange-600"
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
      disabled: loading
    }
  ];

  return (
    <DashboardLayout>
      {/* Error Display */}
      {error && (
        <DashboardError error={error} />
      )}

      {/* Summary Cards */}
      <DashboardStats stats={statsData} loading={loading} />

      {/* Filter Controls */}
      <Toolbar
        actions={actions}
        filters={filterConfigs}
        onClearFilters={clearAllFilters}
        loading={loading}
        showClearButton={true}
      />

      {/* Transactions Table */}
      <DashboardSection>
        {loading ? (
          <TableViewLoading />
        ) : (
          <PayPalTransactionTable
          transactions={filteredTransactions}
          products={productData?.products || []}
          loading={loading}
          productsLoading={productsLoading}
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
