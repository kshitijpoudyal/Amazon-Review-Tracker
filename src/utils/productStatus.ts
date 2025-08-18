import { Product } from '../types/Product';

export type ProductStatusType = 
  | 'void'
  | 'complete' 
  | 'refund-pending'
  | 'send-screenshot'
  | 'review-pending'
  | 'add-review'
  | 'order-placed'
  | 'unknown';

export interface ProductStatusDisplay {
  label: string;
  color: string;
}

/**
 * Determines the current status of a product based on its properties
 */
export const getProductStatusType = (product: Product): ProductStatusType => {
  // Void: When product is marked as void
  if (product.isVoid) {
    return 'void';
  }
  
  // Complete: All workflow steps and financial data complete
  if (product.orderPlaced && 
      product.orderDelivered && 
      product.reviewAdded && 
      product.reviewLive && 
      product.reviewSSSent &&
      product.paid !== null &&
      product.received !== null) {
    return 'complete';
  }

  // Refund Pending: Screenshot sent but no refund received yet
  if (product.orderPlaced && 
      product.orderDelivered && 
      product.reviewAdded && 
      product.reviewLive && 
      product.reviewSSSent &&
      product.paid !== null &&
      product.received == null) {
    return 'refund-pending';
  }

  // Send Screenshot: Review is live but screenshot not sent yet
  if (product.orderPlaced && 
      product.orderDelivered && 
      product.reviewAdded && 
      product.reviewLive && 
      !product.reviewSSSent &&
      product.paid !== null) {
    return 'send-screenshot';
  }

  // Review Pending: Review added but not live yet
  if (product.orderPlaced && 
      product.orderDelivered && 
      product.reviewAdded && 
      !product.reviewLive &&
      !product.reviewSSSent &&
      product.paid !== null) {
    return 'review-pending';
  }

  // Add Review: Order delivered but review not added yet
  if (product.orderPlaced && 
      product.orderDelivered && 
      !product.reviewAdded && 
      !product.reviewLive && 
      !product.reviewSSSent &&
      product.paid !== null) {
    return 'add-review';
  }

  // Order Placed: Order placed but not delivered yet
  if (product.orderPlaced && 
      !product.orderDelivered && 
      !product.reviewAdded && 
      !product.reviewLive && 
      !product.reviewSSSent &&
      product.paid !== null &&
      product.received === null) {
    return 'order-placed';
  }

  // Fallback for edge cases
  return 'unknown';
};

/**
 * Maps status types to display information (label and color classes)
 */
export const getStatusDisplay = (statusType: ProductStatusType): ProductStatusDisplay => {
  const statusMap: Record<ProductStatusType, ProductStatusDisplay> = {
    'void': { label: 'Void', color: 'bg-gray-100 text-gray-800' },
    'complete': { label: 'Complete', color: 'bg-green-100 text-green-800' },
    'refund-pending': { label: 'Refund Pending', color: 'bg-blue-100 text-blue-800' },
    'send-screenshot': { label: 'Send Screenshot', color: 'bg-indigo-100 text-indigo-800' },
    'review-pending': { label: 'Review Pending', color: 'bg-yellow-100 text-yellow-800' },
    'add-review': { label: 'Add Review', color: 'bg-orange-100 text-orange-800' },
    'order-placed': { label: 'Order Placed', color: 'bg-purple-100 text-purple-800' },
    'unknown': { label: 'Status Unknown', color: 'bg-gray-100 text-gray-800' }
  };

  return statusMap[statusType];
};

/**
 * Combined function that returns both status type and display info
 */
export const getProductStatus = (product: Product) => {
  const statusType = getProductStatusType(product);
  const display = getStatusDisplay(statusType);
  
  return {
    type: statusType,
    ...display
  };
};
