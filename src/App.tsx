import { useState, useMemo } from 'react';
import StatCard from './components/StatCard';
import ProductTable from './components/ProductTable';
import LoadingSpinner from './components/LoadingSpinner';
import AddProductForm from './components/AddProductForm';
import FilterControls from './components/FilterControls';
import LoginScreen from './components/LoginScreen';
import AppHeader from './components/AppHeader';
import { useProductCrudFirebase } from './hooks/useProductCrudFirebase';
import { useProductFilters } from './hooks/useProductFilters';
import { useAuth } from './hooks/useAuth';
import { StatusFilter, DeltaFilter } from './types/Product';

function App() {
  // Authentication
  const { user, logout } = useAuth();

  // Use Firebase only for data storage
  const {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
  } = useProductCrudFirebase(user?.uid);
  
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

    // Use filtered products instead of all products
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
  }, [filteredProducts]); // Changed dependency from [data] to [filteredProducts]

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

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
        <AppHeader user={user} onLogout={logout} />

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

        {/* Filter Controls */}
        <FilterControls
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          deltaFilter={deltaFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onDeltaFilterChange={setDeltaFilter}
          onClearFilters={() => {
            setSearchTerm('');
            setStatusFilter('');
            setDeltaFilter('');
          }}
          showAddProduct={() => setShowAddForm(true)}
          loading={loading}
        />

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
