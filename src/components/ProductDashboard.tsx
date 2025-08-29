import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ProductTable from './ProductTable';
import AddProductForm from './AddProductForm';
import { useProductFilters } from '../hooks/useProductFilters';
import { useGenericFilters } from '../hooks/useGenericFilters';
import { useDashboardState } from '../hooks/useDashboardState';
import { useAuth } from '../hooks/useAuth';
import { useDataSource } from '../hooks/useDataSource';
import { useProductStats } from '../hooks/useProductStats';
import { useSortedProducts } from '../hooks/useSortedProducts';
import { StatusFilter, DeltaFilter, Product } from '../types/Product';
import { 
  DashboardContainer, 
  DashboardStats, 
  DashboardError, 
  DashboardLoading, 
  DashboardActions,
  DashboardSection,
  GenericFilterControls,
  FilterControlConfig
} from './common';

function ProductDashboard() {
  // Check if we're in public user page mode
  const { username } = useParams<{ username: string }>();
  const isPublicMode = !!username;

  // Authentication (only for private mode)
  const { user } = useAuth();

  // Dashboard state management
  const { showAddForm, handleShowAddForm, handleHideAddForm } = useDashboardState();

  // Filter state management
  const { 
    updateFilter, 
    clearFilters: clearAllFilters,
    getFilterValue 
  } = useGenericFilters({
    initialFilters: {
      searchTerm: '',
      statusFilter: '',
      deltaFilter: ''
    }
  });

  // Extract filter values for backward compatibility
  const searchTerm = getFilterValue('searchTerm');
  const statusFilter = getFilterValue('statusFilter') as StatusFilter;
  const deltaFilter = getFilterValue('deltaFilter') as DeltaFilter;

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
  
  // Product filtering and sorting
  const { applyFilters } = useProductFilters(data?.products || []);
  const filteredProducts = useSortedProducts(applyFilters, searchTerm, statusFilter, deltaFilter);

  // Stats calculation
  const stats = useProductStats(filteredProducts);

  // Callback handlers
  const handleAddProduct = useCallback((product: Product) => {
    addProduct(product);
    handleHideAddForm();
  }, [addProduct, handleHideAddForm]);

  // Configure filter controls
  const filterConfigs: FilterControlConfig[] = [
    {
      type: 'search',
      key: 'searchTerm',
      placeholder: 'Search products...',
      value: searchTerm,
      onChange: (value) => updateFilter('searchTerm', value)
    },
    {
      type: 'select',
      key: 'statusFilter',
      value: statusFilter,
      onChange: (value) => updateFilter('statusFilter', value),
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'order-placed', label: 'Order Placed' },
        { value: 'add-review', label: 'Add Review' },
        { value: 'review-pending', label: 'Review Pending' },
        { value: 'send-screenshot', label: 'Send Screenshot' },
        { value: 'refund-pending', label: 'Refund Pending' },
        { value: 'complete', label: 'Complete' },
        { value: 'void', label: 'Void' }
      ]
    },
    {
      type: 'select',
      key: 'deltaFilter',
      value: deltaFilter,
      onChange: (value) => updateFilter('deltaFilter', value),
      options: [
        { value: '', label: 'All Deltas' },
        { value: 'positive', label: 'Positive' },
        { value: 'negative', label: 'Negative' },
        { value: 'zero', label: 'Zero' }
      ]
    }
  ];

  // Configure actions for DashboardActions component
  const actions = !isPublicMode ? [
    {
      label: "Add Product",
      onClick: handleShowAddForm,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      variant: 'primary' as const,
      disabled: loading
    }
  ] : [];

  if (loading) {
    return <DashboardLoading message="Loading products..." />;
  }

  if (error) {
    return (
      <DashboardError 
        error={isPublicMode 
          ? `Error loading user data: ${error}` 
          : `Error loading data: ${error}`
        }
        additionalInfo={isPublicMode && error === 'User not found' ? (
          <p className="text-sm mt-2 text-gray-600">
            User "{username}" not found
          </p>
        ) : undefined}
      />
    );
  }

  // Prepare stats data for the common component
  const statsData = stats ? [
    {
      value: stats.totalProducts || '-',
      label: "Total Products"
    },
    {
      value: stats.completedOrders || '-',
      label: "Completed Orders",
      className: "text-green-600"
    },
    {
      value: `$${stats.totalPaid.toFixed(2)}`,
      label: "Total Paid",
      className: "text-yellow-600"
    },
    {
      value: `$${stats.totalReceived.toFixed(2)}`,
      label: "Total Received",
      className: "text-green-600"
    },
    {
      value: `$${stats.remainingRefund.toFixed(2)}`,
      label: "Remaining Refund",
      className: "text-orange-600"
    },
    {
      value: `$${stats.netDelta.toFixed(2)}`,
      label: "Net Profit/Loss",
      className: stats.netDelta >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ] : [];

  return (
    <DashboardContainer>

      {/* Stats Cards */}
      <DashboardStats stats={statsData} loading={loading} />

      {/* Action Buttons */}
      <DashboardActions actions={actions} loading={loading} />

      {/* Filter Controls */}
      <GenericFilterControls
        filters={filterConfigs}
        onClearFilters={clearAllFilters}
        loading={loading}
        readOnly={isPublicMode}
      />

      {/* Product Table */}
      <DashboardSection border={false}>
        <ProductTable 
          products={filteredProducts} 
          onUpdateProduct={isPublicMode ? undefined : updateProduct}
          onDeleteProduct={isPublicMode ? undefined : deleteProduct}
          readOnly={isPublicMode}
          userId={isPublicMode ? undefined : user?.uid}
        />
      </DashboardSection>

      {/* Add Product Modal - only in private mode */}
      {!isPublicMode && showAddForm && (
        <AddProductForm
          onAdd={handleAddProduct}
          onCancel={handleHideAddForm}
        />
      )}
    </DashboardContainer>
  );
}

export default ProductDashboard;
