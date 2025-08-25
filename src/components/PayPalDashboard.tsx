import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePayPalTransactions } from '../hooks/usePayPalTransactions';
import { PayPalCSVImporter } from './PayPalCSVImporter';
import { PayPalTransactionTable } from './PayPalTransactionTable';
import { AddPayPalTransactionForm } from './AddPayPalTransactionForm';
import StatCard from './StatCard';
import AppHeader from './AppHeader';

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
    refetch
  } = usePayPalTransactions(user?.uid);

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

  const handleDeleteTransaction = async (transactionId: string) => {
    const success = await deleteTransaction(transactionId);
    if (success) {
      await refetch();
    }
    return success;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your PayPal dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header with Navigation */}
      <AppHeader user={user} onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              value={`$${data.summary.netIncome.toFixed(2)}`}
              label="Net Income"
              className="text-blue-600"
            />
            <StatCard
              value={data.summary.transactionCount}
              label="Transactions"
              className="text-purple-600"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8">
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
        <div className="mb-8">
          <PayPalCSVImporter
            onImportComplete={handleImport}
            isLoading={loading}
          />
        </div>

        {/* Transactions Table */}
        <PayPalTransactionTable
          transactions={data?.transactions || []}
          loading={loading}
          onDeleteTransaction={handleDeleteTransaction}
        />

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
