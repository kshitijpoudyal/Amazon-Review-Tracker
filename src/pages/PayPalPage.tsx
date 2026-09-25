import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGenericFilters } from '../hooks/useGenericFilters';
import { useDashboardState } from '../hooks/useDashboardState';
import { usePayPalTransactions } from '../hooks/usePayPalTransactions';
import { useProductCrudFirebase } from '../hooks/useProductCrudFirebase';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { PayPalTransactionTable } from '../components/PaypalDashboard/PayPalTransactionTable';
import { AddPayPalTransactionForm } from '../components/PaypalDashboard/AddPayPalTransactionForm';
import { EditPayPalTransactionModal } from '../components/PaypalDashboard/EditPayPalTransactionModal';
import {
  DashboardLayout,
  DashboardStats,
  DashboardError,
  DashboardSection,
  FilterControlConfig,
  PullToRefresh,
  useToast
} from '../components/common';
import { formatCurrency } from '../utils/currency';
import Toolbar from '../components/common/Toolbar';
import { getStatsColor } from '../utils/colors';
import { ProductLinkOptions } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';

function transactionMatchesAmountSearch(search: string, transaction: PayPalTransaction): boolean {
  const trimmed = search.trim();
  const normalized = trimmed.toLowerCase().replace(/[$,\s]/g, '');
  if (!normalized || !/\d/.test(normalized)) return false;

  return [transaction.amount, transaction.fees, transaction.total].some((value) => {
    if (value == null) return false;
    const absValue = Math.abs(value);
    return (
      absValue.toFixed(2).includes(normalized) ||
      value.toFixed(2).includes(normalized) ||
      formatCurrency(value).toLowerCase().includes(trimmed.toLowerCase()) ||
      formatCurrency(absValue).toLowerCase().includes(trimmed.toLowerCase())
    );
  });
}

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
  const { showToast } = useToast();
  const { showAddForm, handleShowAddForm, handleHideAddForm } = useDashboardState();

  const urlLinkFilter = new URLSearchParams(window.location.search).get('link') ?? '';

  // Filter state management
  const {
    updateFilter,
    clearFilters: clearAllFilters,
    getFilterValue
  } = useGenericFilters({
    initialFilters: {
      searchTerm: '',
      typeFilter: '',
      linkFilter: urlLinkFilter
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
    updateTransaction,
    updateProductLink,
    refetch
  } = usePayPalTransactions(user?.uid);

  const [editingTransaction, setEditingTransaction] = useState<PayPalTransaction | null>(null);

  // Fetch products for mapping
  const { data: productData, loading: productsLoading } = useProductCrudFirebase(user?.uid);

  // Enforce minimum loading time of 3 seconds for main transactions
  const displayLoading = useMinimumLoading(loading);

  // Enforce minimum loading time for products loading as well
  const displayProductsLoading = useMinimumLoading(productsLoading, 0);

  // Filter transactions based on current filter values
  const filteredTransactions = data?.transactions.filter(transaction => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      transaction.name.toLowerCase().includes(q) ||
      transaction.transactionId.toLowerCase().includes(q) ||
      transaction.itemTitle?.toLowerCase().includes(q) ||
      transaction.type.toLowerCase().includes(q) ||
      transactionMatchesAmountSearch(searchTerm, transaction);

    const matchesType = !typeFilter || transaction.type === typeFilter;

    const matchesLinkFilter = !linkFilter ||
      (linkFilter === 'linked' && transaction.linkedProductIds && transaction.linkedProductIds.length > 0) ||
      (linkFilter === 'unlinked' && (!transaction.linkedProductIds || transaction.linkedProductIds.length === 0));

    return matchesSearch && matchesType && matchesLinkFilter;
  }) || [];

  // Configure filter controls
  const filterConfigs: FilterControlConfig[] = [
    {
      type: 'search',
      key: 'searchTerm',
      placeholder: 'Search name, ID, amount, fees, net...',
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
      showToast('Transaction added');
    }
    return success;
  };

  const handleUpdateProductLink = async (
    transactionId: string,
    productIds: string[],
    options?: ProductLinkOptions
  ) => {
    const success = await updateProductLink(transactionId, productIds, options);
    if (success) {
      await refetch();
      const finished = options?.completeWorkflow ? ' — marked complete' : '';
      const split =
        options?.customSplitAmounts || options?.splitPrice ? ' — amount split' : '';
      showToast(
        productIds.length > 0
          ? `Linked ${productIds.length} product${productIds.length !== 1 ? 's' : ''}${finished}${split}`
          : 'Links cleared'
      );
    }
    return success;
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const success = await deleteTransaction(transactionId);
    if (success) {
      await refetch();
      showToast('Transaction deleted', 'error');
    }
    return success;
  };

  const handleSaveTransaction = async (docId: string, transaction: PayPalTransaction) => {
    const success = await updateTransaction(docId, transaction);
    if (success) {
      await refetch();
      showToast('Transaction updated');
    }
    return success;
  };

  // Calculate unlinked transactions from filtered data
  const unlinkedTransactionsCount = filteredTransactions.filter(
    transaction => !transaction.linkedProductIds || transaction.linkedProductIds.length === 0
  ).length;

  // Calculate total amount of unlinked transactions from filtered data
  const unlinkedTransactionsAmount = filteredTransactions
    .filter(transaction => !transaction.linkedProductIds || transaction.linkedProductIds.length === 0)
    .reduce((total, transaction) => total + transaction.total, 0);

  // Prepare stats data
  const statsData = data ? [
    {
      value: formatCurrency(data.summary.totalIncome),
      label: "Received",
      className: getStatsColor('income')
    },
    {
      value: formatCurrency(data.summary.totalFees),
      label: "Fees",
      className: getStatsColor('fees')
    },
    {
      value: formatCurrency(data.summary.netReceivedTotal),
      label: "Net Received",
      className: getStatsColor('netReceived')
    },
    {
      value: filteredTransactions.length,
      label: "Transactions",
      className: getStatsColor('transactionCount')
    },
    {
      value: unlinkedTransactionsCount,
      label: "Unlinked",
      className: getStatsColor('unlinkedCount')
    },
    {
      value: formatCurrency(unlinkedTransactionsAmount),
      label: "Unlinked $",
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
    <PullToRefresh onRefresh={refetch} disabled={displayLoading}>
    <DashboardLayout>
      {/* Error Display */}
      {error && (
        <DashboardError error={error} />
      )}

      {/* Summary Cards */}
      <DashboardStats stats={statsData} loading={displayLoading} />

      <Toolbar
        actions={actions}
        filters={filterConfigs}
        onClearFilters={clearAllFilters}
        loading={displayLoading}
        showClearButton={true}
      />

      {/* Transactions Table */}
      <DashboardSection>
        <PayPalTransactionTable
          transactions={filteredTransactions}
          products={productData?.products || []}
          loading={displayLoading}
          productsLoading={displayProductsLoading}
          onDeleteTransaction={handleDeleteTransaction}
          onEditTransaction={setEditingTransaction}
          onUpdateProductLink={handleUpdateProductLink}
        />
      </DashboardSection>

      {/* Add Transaction Form Modal */}
      <AddPayPalTransactionForm
        isOpen={showAddForm}
        onAddTransaction={handleAddTransaction}
        onImportTransactions={handleImport}
        onCancel={handleHideAddForm}
      />

      <EditPayPalTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onSave={handleSaveTransaction}
        onClose={() => setEditingTransaction(null)}
        isLoading={displayLoading}
      />
    </DashboardLayout>
    </PullToRefresh>
  );
};
