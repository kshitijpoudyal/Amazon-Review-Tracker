import { Product, StatusFilter, DeltaFilter } from '../types/Product';

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
      if (statusFilter === 'void') {
        // Void: When product is marked as void
        matchesStatus = product.isVoid === true;
      } else if (statusFilter === 'new') {
        // New: When an item is ordered but not yet delivered (and not void)
        matchesStatus = !product.isVoid && product.orderPlaced && !product.orderDelivered;
      } else if (statusFilter === 'review-not-added') {
        // Review Not Added: When true for orderDelivered but false for reviewAdded (and not void)
        matchesStatus = !product.isVoid && product.orderDelivered && !product.reviewAdded;
      } else if (statusFilter === 'review-pending') {
        // Review Pending: When true for reviewAdded but false for reviewLive (and not void)
        matchesStatus = !product.isVoid && product.reviewAdded && !product.reviewLive;
      } else if (statusFilter === 'pending-refund') {
        // Pending Refund: When reviewSSSent is true but received is null (and not void)
        matchesStatus = !product.isVoid && product.reviewSSSent && product.received === null;
      } else if (statusFilter === 'complete') {
        // Complete: When all columns are filled (and not void)
        matchesStatus = !product.isVoid && product.orderPlaced && 
                      product.orderDelivered && 
                      product.reviewAdded && 
                      product.reviewLive && 
                      product.reviewSSSent &&
                      product.paid !== null &&
                      product.received !== null;
      }

      // Delta filter
      let matchesDelta = true;
      if (deltaFilter && product.delta !== null) {
        const delta = product.delta;
        if (deltaFilter === 'positive') {
          matchesDelta = delta > 0;
        } else if (deltaFilter === 'negative') {
          matchesDelta = delta < 0;
        } else if (deltaFilter === 'zero') {
          matchesDelta = delta === 0;
        }
      }

      return matchesSearch && matchesStatus && matchesDelta;
    });
  };

  return { applyFilters };
};
