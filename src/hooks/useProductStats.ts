import { useMemo } from 'react';
import { Product } from '../types/Product';

export interface ProductStats {
  totalProducts: number;
  completedOrders: number;
  totalPaid: number;
  totalReceived: number;
  netDelta: number;
  remainingRefund: number;
}

export const useProductStats = (products: Product[]): ProductStats | null => {
  return useMemo(() => {
    if (!products?.length) return null;

    // Filter out empty products
    const validProducts = products.filter(p => p.item);
    
    const completedOrders = validProducts.filter(p => 
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

    validProducts.forEach(product => {
      // Add paid amount
      if (product.paid !== null && !isNaN(product.paid)) {
        totalPaid += product.paid;
      }
      
      // Add received amount
      if (product.received !== null && !isNaN(product.received)) {
        totalReceived += product.received;
      }
      
      // Add delta
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
      totalProducts: validProducts.length,
      completedOrders,
      totalPaid,
      totalReceived,
      netDelta,
      remainingRefund
    };
  }, [products]);
};
