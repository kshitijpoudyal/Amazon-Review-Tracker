import { Product, StatusFilter, DeltaFilter } from '../types/Product';
import { getProductStatusType } from '../utils/productStatus';

export const useProductFilters = (products: Product[]) => {
  const applyFilters = (
    searchTerm: string,
    statusFilter: StatusFilter,
    deltaFilter: DeltaFilter
  ): Product[] => {
    return products.filter(product => {
      // Skip empty products
      if (!product.item) return false;

      // Search filter
      const matchesSearch = product.item.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter) {
        const productStatusType = getProductStatusType(product);
        
        // Map filter values to status types
        const statusMapping: Record<string, string> = {
          'void': 'void',
          'complete': 'complete',
          'refund-pending': 'refund-pending',
          'review-pending': 'review-pending',
          'send-screenshot': 'send-screenshot',
          'add-review': 'add-review',
          'order-placed': 'order-placed'
        };
        
        matchesStatus = productStatusType === statusMapping[statusFilter];
      }

      // Delta filter
      let matchesDelta = true;
      if (deltaFilter) {
        // Only apply delta filter to products with valid paid, received, and delta values
        if (product.delta !== null && product.paid !== null && product.received !== null) {
          const delta = product.delta;
          
          if (deltaFilter === 'positive') {
            matchesDelta = delta > 0;
          } else if (deltaFilter === 'negative') {
            matchesDelta = delta < 0;
          } else if (deltaFilter === 'zero') {
            matchesDelta = delta === 0;
          }
        } else {
          // If delta filter is active but product has null values, exclude it
          matchesDelta = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDelta;
    });
  };

  return { applyFilters };
};
