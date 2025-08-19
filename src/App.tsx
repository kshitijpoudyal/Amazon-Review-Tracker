import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
import { useUserData } from './hooks/useUserData';
import { StatusFilter, DeltaFilter } from './types/Product';

function App() {
  // Check if we're in public user page mode
  const { username } = useParams<{ username: string }>();
  const isPublicMode = !!username;

  // Authentication (only for private mode)
  const { user, logout } = useAuth();

  // Data fetching - use different hooks based on mode
  const privateData = useProductCrudFirebase(user?.uid);
  const publicData = useUserData(username);

  // Choose the appropriate data source
  const {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
  } = isPublicMode ? {
    data: publicData.data,
    loading: publicData.loading,
    error: publicData.error,
    updateProduct: async () => false, // No-op in public mode
    addProduct: async () => false,    // No-op in public mode
    deleteProduct: async () => false, // No-op in public mode
  } : privateData;
  
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

  // Show login screen if not authenticated AND not in public mode
  if (!user && !isPublicMode) {
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
            <p className="text-lg">
              {isPublicMode 
                ? `Error loading user data: ${error}` 
                : `Error loading data: ${error}`
              }
            </p>
            {isPublicMode && error === 'User not found' && (
              <p className="text-sm mt-2 text-gray-600">
                User "{username}" not found
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-1 p-5">
      <div className="max-w-8xl mx-auto glass-effect rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        {isPublicMode ? (
          <div className="gradient-bg text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
              {publicData.userProfile?.displayName || publicData.userProfile?.email || username}'s Amazon Review Dashboard
            </h1>
            <p className="text-blue-100">Public View - Read Only</p>
          </div>
        ) : (
          <AppHeader user={user!} onLogout={logout} />
        )}

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
          showAddProduct={isPublicMode ? undefined : () => setShowAddForm(true)}
          loading={loading}
          readOnly={isPublicMode}
        />

        {/* Public Page Link - only show in private mode */}
        {/* {!isPublicMode && (
          <div className="px-8 pt-4">
            <PublicPageLink user={user} />
          </div>
        )} */}

        {/* Product Table */}
        <div className="p-8">
          <ProductTable 
            products={filteredProducts} 
            onUpdateProduct={isPublicMode ? undefined : updateProduct}
            onDeleteProduct={isPublicMode ? undefined : deleteProduct}
            readOnly={isPublicMode}
          />
        </div>

        {/* Add Product Modal - only in private mode */}
        {!isPublicMode && showAddForm && (
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
