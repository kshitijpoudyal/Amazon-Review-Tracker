import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import StatsGrid from './StatsGrid';
import ProductTable from './ProductTable';
import LoadingSpinner from './LoadingSpinner';
import AddProductForm from './AddProductForm';
import FilterControls from './FilterControls';
import { useProductFilters } from '../hooks/useProductFilters';
import { useAuth } from '../hooks/useAuth';
import { useDataSource } from '../hooks/useDataSource';
import { useProductStats } from '../hooks/useProductStats';
import { useSortedProducts } from '../hooks/useSortedProducts';
import { StatusFilter, DeltaFilter, Product } from '../types/Product';

function ProductDashboard() {
  // Check if we're in public user page mode
  const { username } = useParams<{ username: string }>();
  const isPublicMode = !!username;

  // Authentication (only for private mode)
  const { user } = useAuth();

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

  // Return null if user is not authenticated and not in public mode
  // App.tsx will handle showing LoginScreen
  if (!user && !isPublicMode) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-8">
      {/* Public mode header */}
      {isPublicMode && (
        <div className="gradient-bg text-white p-8 text-center rounded-2xl">
          <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
            {userProfile?.displayName || userProfile?.email || username}'s Review Dashboard
          </h1>
          <p className="text-blue-100">Public View - Read Only</p>
        </div>
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
  );
}

export default ProductDashboard;
