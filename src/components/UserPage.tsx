import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StatCard from './StatCard';
import LoadingSpinner from './LoadingSpinner';
import { useUserData } from '../hooks/useUserData';
import { useProductFilters } from '../hooks/useProductFilters';
import { StatusFilter, DeltaFilter, Product } from '../types/Product';

const UserPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [deltaFilter, setDeltaFilter] = useState<DeltaFilter>('');

  // Fetch user data based on username/email
  const { data, loading, error, userProfile } = useUserData(username);
  const { applyFilters } = useProductFilters(data?.products || []);

  const filteredProducts = useMemo(() => {
    const filtered = applyFilters(searchTerm, statusFilter, deltaFilter);
    // Sort by order date (most recent first), then by item name
    return filtered.sort((a, b) => {
      if (!a.orderDate && !b.orderDate) {
        return a.item.localeCompare(b.item);
      }
      if (!a.orderDate) return 1;
      if (!b.orderDate) return -1;
      
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      const dateDiff = dateB.getTime() - dateA.getTime();
      
      if (dateDiff === 0) {
        return a.item.localeCompare(b.item);
      }
      
      return dateDiff;
    });
  }, [applyFilters, searchTerm, statusFilter, deltaFilter]);

  const stats = useMemo(() => {
    if (!data) return null;

    const products = filteredProducts.filter(p => p.item);
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
  }, [filteredProducts, data]);

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
            <p className="text-lg">Error loading user data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !userProfile) {
    return (
      <div className="min-h-screen gradient-bg p-5">
        <div className="max-w-7xl mx-auto glass-effect rounded-3xl shadow-card overflow-hidden">
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg">User "{username}" not found</p>
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
            {userProfile.displayName || userProfile.email}'s Amazon Review Dashboard
          </h1>
          <p className="text-blue-100">Public View - Read Only</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-5 p-8 bg-gray-50 border-b border-gray-200">
          <StatCard 
            value={stats?.totalProducts || '-'} 
            label="Total Products" 
          />
          <StatCard 
            value={stats?.completedOrders || '-'} 
            label="Completed Orders" 
            className="text-green-600"
          />
          <StatCard 
            value={stats ? `$${stats.totalPaid.toFixed(2)}` : '-'} 
            label="Total Paid" 
            className="text-yellow-600"
          />
          <StatCard 
            value={stats ? `$${stats.totalReceived.toFixed(2)}` : '-'} 
            label="Total Received" 
            className="text-green-600"
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

        {/* Filter Controls (Read-only version) */}
        <div className="p-8 bg-gray-100 border-b border-gray-200">
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Products
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by item name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="void">Void</option>
                </select>
              </div>

              {/* Delta Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit/Loss
                </label>
                <select
                  value={deltaFilter}
                  onChange={(e) => setDeltaFilter(e.target.value as DeltaFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All</option>
                  <option value="profit">Profit</option>
                  <option value="loss">Loss</option>
                  <option value="break-even">Break Even</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  &nbsp;
                </label>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setDeltaFilter('');
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Read-only Product Table */}
        <div className="p-8">
          <ReadOnlyProductTable products={filteredProducts} />
        </div>
      </div>
    </div>
  );
};

// Read-only product table component
const ReadOnlyProductTable: React.FC<{ products: Product[] }> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delta</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <tr key={product.id || index} className={product.isVoid ? 'bg-red-50' : ''}>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div className="max-w-xs truncate" title={product.item}>
                  {product.item}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {product.orderDate || '-'}
              </td>
              <td className="px-4 py-4 text-sm">
                <StatusBadge product={product} />
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {product.paid !== null ? `$${product.paid.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {product.received !== null ? `$${product.received.toFixed(2)}` : '-'}
              </td>
              <td className="px-4 py-4 text-sm">
                <DeltaBadge delta={product.delta} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Status badge component
const StatusBadge: React.FC<{ product: Product }> = ({ product }) => {
  if (product.isVoid) {
    return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Void</span>;
  }

  const isCompleted = product.orderPlaced && 
                     product.orderDelivered && 
                     product.reviewAdded && 
                     product.reviewLive && 
                     product.reviewSSSent;

  if (isCompleted) {
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
  }

  if (product.orderPlaced && product.orderDelivered) {
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">In Progress</span>;
  }

  return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Pending</span>;
};

// Delta badge component
const DeltaBadge: React.FC<{ delta: number | null }> = ({ delta }) => {
  if (delta === null) {
    return <span className="text-gray-500">-</span>;
  }

  const isProfit = delta > 0;
  const isBreakEven = delta === 0;

  if (isBreakEven) {
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">$0.00</span>;
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isProfit 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isProfit ? '+' : ''}${delta.toFixed(2)}
    </span>
  );
};

export default UserPage;
