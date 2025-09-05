import { Product } from '../types/Product';
import { getProductStatusType } from './productStatus';

/**
 * Compares two products and determines if the status has changed
 */
export const hasStatusChanged = (oldProduct: Product, newProduct: Product): boolean => {
  const oldStatus = getProductStatusType(oldProduct);
  const newStatus = getProductStatusType(newProduct);
  
  return oldStatus !== newStatus;
};

/**
 * Updates the product with status tracking information
 */
export const updateProductWithStatusTracking = (
  oldProduct: Product | null, 
  newProduct: Product
): Product => {
  const now = new Date().toISOString();
  
  // If this is a new product or status has changed, update the timestamp
  if (!oldProduct || hasStatusChanged(oldProduct, newProduct)) {
    return {
      ...newProduct,
      statusLastChanged: now
    };
  }
  
  // If status hasn't changed, preserve the original timestamp
  return {
    ...newProduct,
    statusLastChanged: oldProduct.statusLastChanged || now
  };
};

/**
 * Checks if a product has been in the same status for more than the specified days
 */
export const isProductStagnant = (product: Product, daysThreshold: number = 14): boolean => {
  if (!product.statusLastChanged) {
    return false; // Can't determine if we don't have the timestamp
  }
  
  const statusChangeDate = new Date(product.statusLastChanged);
  const now = new Date();
  const daysDifference = (now.getTime() - statusChangeDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysDifference >= daysThreshold;
};

/**
 * Gets all stagnant products for a user
 */
export const getStagnantProducts = (products: Product[], daysThreshold: number = 14): Product[] => {
  return products.filter(product => 
    !product.isVoid && // Don't include voided products
    isProductStagnant(product, daysThreshold)
  );
};

/**
 * Checks if a notification should be sent for stagnant products
 * Only sends if it's been at least 7 days since the last notification
 */
export const shouldSendNotification = (
  stagnantProducts: Product[],
  daysSinceLastNotification: number = 7
): boolean => {
  if (stagnantProducts.length === 0) {
    return false;
  }
  
  // Check if any product needs a notification
  return stagnantProducts.some(product => {
    if (product.received !== null && product.reviewSSSent) {
        return false; // Product is complete, no notification needed
    }
    
    if (!product.lastNotificationSent) {
      return true; // Never sent a notification for this product
    }
    
    const lastNotificationDate = new Date(product.lastNotificationSent);
    const now = new Date();
    const daysSinceLastNotif = (now.getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceLastNotif >= daysSinceLastNotification;
  });
};
