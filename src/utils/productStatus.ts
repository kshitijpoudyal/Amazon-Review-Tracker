import { Product } from '../types/Product';
import { getBadgeClasses } from './colors';

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

export const getStatusDisplay = (statusType: ProductStatusType): ProductStatusDisplay => {
  const statusMap: Record<ProductStatusType, ProductStatusDisplay> = {
    'void': { label: 'Void', color: `${getBadgeClasses('void')}` },
    'complete': { label: 'Complete', color: `${getBadgeClasses('complete')}` },
    'refund-pending': { label: 'Refund Pending', color: `${getBadgeClasses('refundPending')}` },
    'send-screenshot': { label: 'Send Screenshot', color: `${getBadgeClasses('sendScreenshot')}` },
    'review-pending': { label: 'Review Pending', color: `${getBadgeClasses('reviewPending')}` },
    'add-review': { label: 'Add Review', color: `${getBadgeClasses('addReview')}` },
    'order-placed': { label: 'Order Placed', color: `${getBadgeClasses('orderPlaced')}` },
    'unknown': { label: 'Status Unknown', color: `${getBadgeClasses('unknown')}` }
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
