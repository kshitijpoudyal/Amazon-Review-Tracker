import { useState, useMemo } from 'react';
import StatCard from './components/StatCard';
import ProductTable from './components/ProductTable';
import LoadingSpinner from './components/LoadingSpinner';
import AddProductForm from './components/AddProductForm';
import { useProductCrudFirebase } from './hooks/useProductCrudFirebase';
import { useProductFilters } from './hooks/useProductFilters';
import { StatusFilter, DeltaFilter } from './types/Product';

function App() {
  // Use Firebase only for data storage
  const {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
  } = useProductCrudFirebase();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [deltaFilter, setDeltaFilter] = useState<DeltaFilter>('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { applyFilters } = useProductFilters(data?.products || []);

  const filteredProducts = useMemo(() => {
    const filtered = applyFilters(searchTerm, statusFilter, deltaFilter);
    // Sort by order date (most recent first), then by item name
    return filtered.sort((a, b) => {
      // Handle items without order dates - they appear last
      if (!a.orderDate && !b.orderDate) {
        return a.item.localeCompare(b.item);
      }
      if (!a.orderDate) return 1; // a goes after b
      if (!b.orderDate) return -1; // a goes before b
      
      // Both have order dates - sort by date (most recent first)
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      const dateDiff = dateB.getTime() - dateA.getTime();
      
      // If dates are the same, sort by item name
      if (dateDiff === 0) {
        return a.item.localeCompare(b.item);
      }
      
      return dateDiff;
    });
  }, [applyFilters, searchTerm, statusFilter, deltaFilter]);

  const stats = useMemo(() => {
    if (!data) return null;

    const products = data.products.filter(p => p.item);
    const completedOrders = products.filter(p => 
      p.orderPlaced && 
      p.orderDelivered && 
      p.reviewAdded && 
      p.reviewLive && 
      p.reviewSSSent &&
      p.paid !== null &&
      p.received !== null
    ).length;

    let totalPaid = 0;
    let totalReceived = 0;
    let netDelta = 0;
    let remainingRefund = 0;

    products.forEach(product => {
      if (product.paid !== null && !isNaN(product.paid)) {
        totalPaid += product.paid;
      }
      if (product.received !== null && !isNaN(product.received)) {
        totalReceived += product.received;
      }
      if (product.delta !== null && !isNaN(product.delta)) {
        netDelta += product.delta;
      }

      // Calculate remaining refund for incomplete orders
      const isComplete = product.orderPlaced && 
                        product.orderDelivered && 
                        product.reviewAdded && 
                        product.reviewLive && 
                        product.reviewSSSent &&
                        product.received !== null && !isNaN(product.received);
      
      if (!isComplete && product.paid !== null && !isNaN(product.paid)) {
        remainingRefund += product.paid;
      }
    });

    return {
      totalProducts: products.length,
      completedOrders,
      totalPaid,
      totalReceived,
      netDelta,
      remainingRefund
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg p-5">
        <div className="max-w-7xl mx-auto glass-effect rounded-3xl shadow-card overflow-hidden">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg p-5">
        <div className="max-w-7xl mx-auto glass-effect rounded-3xl shadow-card overflow-hidden">
          <div className="text-center py-16 text-red-600">
            <p className="text-lg">Error loading data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-1 p-5">
      <div className="max-w-8xl mx-auto glass-effect rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="gradient-bg text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
            Amazon Review Products Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 p-8 bg-gray-50 border-b border-gray-200">
          <StatCard 
            value={stats?.totalProducts || '-'} 
            label="Total Products" 
          />
          <StatCard 
            value={stats?.completedOrders || '-'} 
            label="Completed Orders" 
          />
          <StatCard 
            value={stats ? `$${stats.totalPaid.toFixed(2)}` : '-'} 
            label="Total Paid" 
          />
          <StatCard 
            value={stats ? `$${stats.totalReceived.toFixed(2)}` : '-'} 
            label="Total Received" 
          />
          <StatCard 
            value={stats ? `$${stats.remainingRefund.toFixed(2)}` : '-'} 
            label="Remaining Refund"
            className="text-orange-600"
          />
          <StatCard 
            value={stats ? `$${stats.netDelta.toFixed(2)}` : '-'} 
            label="Net Profit/Loss"
            className={stats && stats.netDelta >= 0 ? 'text-green-600' : 'text-red-600'}
          />
        </div>

        {/* Combined Toolbar and Filters Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          {/* Top Row - Actions and Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            {/* Left side - Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Bottom Row - Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="complete">Complete</option>
                <option value="pending-refund">Pending Refund</option>
                <option value="review-pending">Review Pending</option>
                <option value="review-not-added">Review Not Added</option>
                <option value="new">New</option>
                <option value="not-started">Not Started</option>
                <option value="void">Void</option>
              </select>
            </div>

            {/* Delta Filter */}
            <div className="flex-shrink-0">
              <select
                value={deltaFilter}
                onChange={(e) => setDeltaFilter(e.target.value as DeltaFilter)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Deltas</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="zero">Zero</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter || deltaFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDeltaFilter('');
                }}
                className="flex-shrink-0 px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="p-8">
          <ProductTable 
            products={filteredProducts} 
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        </div>

        {/* Add Product Modal */}
        {showAddForm && (
          <AddProductForm
            onAdd={(product) => {
              addProduct(product);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
