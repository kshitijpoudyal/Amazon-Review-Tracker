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
    'refund-pending': { label: 'Refund Pending', color: `${getBadgeClasses('refund-pending')}` },
    'send-screenshot': { label: 'Send Screenshot', color: `${getBadgeClasses('send-screenshot')}` },
    'review-pending': { label: 'Review Pending', color: `${getBadgeClasses('review-pending')}` },
    'add-review': { label: 'Add Review', color: `${getBadgeClasses('add-review')}` },
    'order-placed': { label: 'Order Placed', color: `${getBadgeClasses('order-placed')}` },
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

export const isVoid = (product: Product): boolean => {
  return getProductStatusType(product) === 'void';
};

export const isComplete = (product: Product): boolean => {
  return getProductStatusType(product) === 'complete';
};

export const isRefundPending = (product: Product): boolean => {
  return getProductStatusType(product) === 'refund-pending';
};

export const isSendScreenshot = (product: Product): boolean => {
  return getProductStatusType(product) === 'send-screenshot';
};

export const isReviewPending = (product: Product): boolean => {
  return getProductStatusType(product) === 'review-pending';
};

export const isAddReview = (product: Product): boolean => {
  return getProductStatusType(product) === 'add-review';
};

export const isOrderPlaced = (product: Product): boolean => {
  return getProductStatusType(product) === 'order-placed';
};

export const isUnknown = (product: Product): boolean => {
  return getProductStatusType(product) === 'unknown';
};
