import React, { useCallback } from 'react';
import ProductTable from '../components/ProductDashboard/ProductTable';
import AddProductForm from '../components/ProductDashboard/AddProductForm';
import { useAuth } from '../hooks/useAuth';
import { useProductFilters } from '../hooks/useProductFilters';
import { useGenericFilters } from '../hooks/useGenericFilters';
import { useDashboardState } from '../hooks/useDashboardState';
import { useDataSource } from '../hooks/useDataSource';
import { useProductStats } from '../hooks/useProductStats';
import { useSortedProducts } from '../hooks/useSortedProducts';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { useVendors } from '../hooks/useVendors';
import { StatusFilter, DeltaFilter, VendorFilter, Product } from '../types/Product';
import { VendorAdminUtils } from '../components/VendorAdminUtils';
import {
  DashboardContainer,
  DashboardStats,
  DashboardError,
  DashboardSection,
  FilterControlConfig,
  EmailReminderPanel
} from '../components/common';
import Toolbar from '../components/common/Toolbar';
import { getStatsColor } from '../utils/colors';
import { formatCurrency } from '../utils/currency';

/**
 * ProductPage Component
 * 
 * Main dashboard for managing Amazon products and tracking their status.
 * Features:
 * - Product listing with filters and search
 * - Statistical overview of products
 * - Add/edit/delete product functionality
 * - Status tracking and management
 */
const ProductPage: React.FC = () => {
  const { user } = useAuth();
  const { activeVendors } = useVendors();
  
  // Show admin utils when URL contains ?admin=true
  const showAdminUtils = new URLSearchParams(window.location.search).get('admin') === 'true';

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
      deltaFilter: '',
      vendorFilter: ''
    }
  });

  // Extract filter values for backward compatibility
  const searchTerm = getFilterValue('searchTerm');
  const statusFilter = getFilterValue('statusFilter') as StatusFilter;
  const deltaFilter = getFilterValue('deltaFilter') as DeltaFilter;
  const vendorFilter = getFilterValue('vendorFilter') as VendorFilter;

  // Data source management with optimized hook
  const {
    data,
    loading,
    error,
    updateProduct,
    addProduct,
    deleteProduct,
  } = useDataSource(user?.uid);

  // Enforce minimum loading time of 3 seconds
  const displayLoading = useMinimumLoading(loading);

  // Product filtering and sorting
  const { applyFilters } = useProductFilters(data?.products || []);
  const filteredProducts = useSortedProducts(applyFilters, searchTerm, statusFilter, deltaFilter, vendorFilter);

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
    },
    {
      type: 'select',
      key: 'vendorFilter',
      value: vendorFilter,
      onChange: (value) => updateFilter('vendorFilter', value),
      options: [
        { value: '', label: 'All Vendors' },
        ...activeVendors.map(vendor => ({
          value: vendor.id,
          label: vendor.name
        }))
      ]
    }
  ];

  // Configure actions for DashboardActions component
  const actions = [
    {
      label: "Add Product",
      onClick: handleShowAddForm,
      variant: 'primary' as const,
      disabled: displayLoading
    }
  ];

  if (error) {
    return (
      <DashboardError
        error={`Error loading data: ${error}`}
        additionalInfo={undefined}
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
      className: getStatsColor('completed')
    },
    {
      value: formatCurrency(stats.totalPaid),
      label: "Total Paid",
      className: getStatsColor('paid')
    },
    {
      value: formatCurrency(stats.totalReceived),
      label: "Total Received",
      className: getStatsColor('received')
    },
    {
      value: formatCurrency(stats.remainingRefund),
      label: "Remaining Refund",
      className: getStatsColor('remaining')
    },
    {
      value: formatCurrency(stats.netDelta),
      label: "Net Profit/Loss",
      className: getStatsColor('netDelta', stats.netDelta)
    }
  ] : [];

  return (
    <DashboardContainer>
      {/* Stats Cards */}
      <DashboardStats stats={statsData} loading={displayLoading} />
      
      {showAdminUtils && (
        <DashboardSection>
          <EmailReminderPanel />
          <VendorAdminUtils />
        </DashboardSection>
      )}

      {/* Filter Controls */}
      <Toolbar
        actions={actions}
        filters={filterConfigs}
        onClearFilters={clearAllFilters}
        loading={displayLoading}
      />

      {/* Product Table */}
      <DashboardSection>
        <ProductTable
          products={filteredProducts}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
          loading={displayLoading}
          userId={user?.uid}
        />
      </DashboardSection>

      {/* Add Product Modal */}
      <AddProductForm
        isOpen={showAddForm}
        onAdd={handleAddProduct}
        onCancel={handleHideAddForm}
      />
    </DashboardContainer>
  );
};

export default ProductPage;
