import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import StatsGrid from './components/StatsGrid';
import ProductTable from './components/ProductTable';
import LoadingSpinner from './components/LoadingSpinner';
import AddProductForm from './components/AddProductForm';
import FilterControls from './components/FilterControls';
import LoginScreen from './components/LoginScreen';
import AppHeader from './components/AppHeader';
import { useProductFilters } from './hooks/useProductFilters';
import { useAuth } from './hooks/useAuth';
import { useDataSource } from './hooks/useDataSource';
import { useProductStats } from './hooks/useProductStats';
import { useSortedProducts } from './hooks/useSortedProducts';
import { StatusFilter, DeltaFilter, Product } from './types/Product';

function App() {
  // Check if we're in public user page mode
  const { username } = useParams<{ username: string }>();
  const isPublicMode = !!username;

  // Authentication (only for private mode)
  const { user, logout } = useAuth();

  // Data source management with optimized hook
  const {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
    userProfile,
  } = useDataSource(isPublicMode, user?.uid, username);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [deltaFilter, setDeltaFilter] = useState<DeltaFilter>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Product filtering and sorting
  const { applyFilters } = useProductFilters(data?.products || []);
  const filteredProducts = useSortedProducts(applyFilters, searchTerm, statusFilter, deltaFilter);

  // Stats calculation
  const stats = useProductStats(filteredProducts);

  // Callback handlers
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setDeltaFilter('');
  }, []);

  const handleAddProduct = useCallback((product: Product) => {
    addProduct(product);
    setShowAddForm(false);
  }, [addProduct]);

  const handleShowAddForm = useCallback(() => setShowAddForm(true), []);
  const handleCancelAddForm = useCallback(() => setShowAddForm(false), []);

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
              {userProfile?.displayName || userProfile?.email || username}'s Amazon Review Dashboard
            </h1>
            <p className="text-blue-100">Public View - Read Only</p>
          </div>
        ) : (
          <AppHeader user={user!} onLogout={logout} />
        )}

        {/* Stats Cards */}
        <StatsGrid stats={stats} />

        {/* Filter Controls */}
        <FilterControls
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          deltaFilter={deltaFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onDeltaFilterChange={setDeltaFilter}
          onClearFilters={handleClearFilters}
          showAddProduct={isPublicMode ? undefined : handleShowAddForm}
          loading={loading}
          readOnly={isPublicMode}
        />

        {/* Product Table */}
        <div className="p-8">
          <ProductTable 
            products={filteredProducts} 
            onUpdateProduct={isPublicMode ? undefined : updateProduct}
            onDeleteProduct={isPublicMode ? undefined : deleteProduct}
            readOnly={isPublicMode}
            userId={isPublicMode ? undefined : user?.uid}
          />
        </div>

        {/* Add Product Modal - only in private mode */}
        {!isPublicMode && showAddForm && (
          <AddProductForm
            onAdd={handleAddProduct}
            onCancel={handleCancelAddForm}
          />
        )}
      </div>
    </div>
  );
}

export default App;
