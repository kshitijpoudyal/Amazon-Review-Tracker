import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePayPalTransactions } from '../hooks/usePayPalTransactions';
import { useProductCrudFirebase } from '../hooks/useProductCrudFirebase';
import { PayPalCSVImporter } from './PayPalCSVImporter';
import { PayPalTransactionTable } from './PayPalTransactionTable';
import { AddPayPalTransactionForm } from './AddPayPalTransactionForm';
import StatCard from './StatCard';
import AppHeader from './AppHeader';
import LoginScreen from './LoginScreen';

export const PayPalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleImport = async (transactions: any[]) => {
    const result = await importTransactions(transactions);
    
    // Show detailed import results including withdrawal skips
    if (result.withdrawalSkipped > 0) {
      console.log(`📊 Import Results: ${result.added} added, ${result.skipped} duplicates skipped, ${result.withdrawalSkipped} withdrawals skipped`);
    }
    
    return result;
  };

  const handleAddTransaction = async (transaction: any) => {
    const success = await addTransaction(transaction);
    if (success) {
      await refetch();
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

  // Calculate unlinked transactions
  const unlinkedTransactionsCount = data?.transactions.filter(
    transaction => !transaction.linkedProductId
  ).length || 0;

  // Calculate total amount of unlinked transactions
  const unlinkedTransactionsAmount = data?.transactions
    .filter(transaction => !transaction.linkedProductId)
    .reduce((total, transaction) => total + transaction.total, 0) || 0;

  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen gradient-bg-1 p-5">
      <div className="max-w-8xl mx-auto glass-effect rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <AppHeader user={user} onLogout={logout} />
        
        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2">
              <span className="text-lg">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 p-8 bg-gray-50 border-b border-gray-200">
            <StatCard
              value={`$${data.summary.totalIncome.toFixed(2)}`}
              label="Total Income"
              className="text-green-600"
            />
            <StatCard
              value={`$${data.summary.totalFees.toFixed(2)}`}
              label="Total Fees"
              className="text-red-600"
            />
            <StatCard
              value={`$${data.summary.netReceivedTotal.toFixed(2)}`}
              label="Net Received Total"
              className="text-blue-600"
            />
            <StatCard
              value={data.summary.transactionCount}
              label="Transactions"
              className="text-purple-600"
            />
            <StatCard
              value={unlinkedTransactionsCount}
              label="Unlinked Count"
              className="text-orange-600"
            />
            <StatCard
              value={`$${unlinkedTransactionsAmount.toFixed(2)}`}
              label="Unlinked Amount"
              className="text-orange-600"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
              disabled={loading}
            >
              <span>➕</span>
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* CSV Import */}
        <div className="p-8 border-b border-gray-200">
          <PayPalCSVImporter
            onImportComplete={handleImport}
            isLoading={loading}
          />
        </div>

        {/* Transactions Table */}
        <div className="p-8">
          <PayPalTransactionTable
            transactions={data?.transactions || []}
            products={productData?.products || []}
            loading={loading}
            productsLoading={productsLoading}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateProductLink={handleUpdateProductLink}
          />
        </div>

        {/* Add Transaction Form Modal */}
        {showAddForm && (
          <AddPayPalTransactionForm
            onAddTransaction={handleAddTransaction}
            onCancel={() => setShowAddForm(false)}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};
