import { useMemo } from 'react';
import { Product } from '../types/Product';
import { getStagnantProducts, shouldSendNotification } from '../utils/statusTracker';

export interface StagnantProductsInfo {
  stagnantProducts: Product[];
  shouldNotify: boolean;
  totalStagnant: number;
  needsAttention: boolean;
}

/**
 * Hook to check for stagnant products and notification status
 */
export const useStagnantProducts = (products: Product[], daysThreshold: number = 14): StagnantProductsInfo => {
  return useMemo(() => {
    const stagnantProducts = getStagnantProducts(products, daysThreshold);
    const shouldNotify = shouldSendNotification(stagnantProducts, 7);
    
    return {
      stagnantProducts,
      shouldNotify,
      totalStagnant: stagnantProducts.length,
      needsAttention: stagnantProducts.length > 0
    };
  }, [products, daysThreshold]);
};
