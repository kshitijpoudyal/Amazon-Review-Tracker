import { Product } from '../types/Product';

export interface EmailReminderData {
  productItem: string;
  orderDate: string;
  daysRemaining: number;
  userEmail?: string;
}

// Calculate days since order date
export const calculateDaysSinceOrder = (orderDate: string | null): number => {
  if (!orderDate) return 0;
  
  const orderDateObj = new Date(orderDate);
  const today = new Date();
  const timeDifference = today.getTime() - orderDateObj.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
  
  return daysDifference;
};

// Check if product needs return window reminder
export const needsReturnWindowReminder = (product: Product): boolean => {
  if (!product.orderDate) return false;
  
  const daysSinceOrder = calculateDaysSinceOrder(product.orderDate);
  const status = getProductStatus(product);
  
  // Send reminder if order is more than 20 days old and status is not complete or void
  return daysSinceOrder > 20 && status !== 'complete' && status !== 'void';
};

// Get product status (similar to productStatus.ts but simplified)
const getProductStatus = (product: Product): string => {
  if (product.isVoid) return 'void';
  if (product.reviewLive) return 'complete';
  if (product.reviewSSSent) return 'refund-pending';
  if (product.reviewAdded) return 'send-screenshot';
  if (product.orderDelivered) return 'review-pending';
  if (product.orderPlaced) return 'add-review';
  return 'order-placed';
};

// Get products that need return window reminders
export const getProductsNeedingReminders = (products: Product[]): Product[] => {
  return products.filter(needsReturnWindowReminder);
};

// Format email reminder message
export const formatReminderMessage = (product: Product): string => {
  const daysSinceOrder = calculateDaysSinceOrder(product.orderDate);
  const daysRemaining = Math.max(0, 30 - daysSinceOrder); // Assuming 30-day return window
  
  return `Your product "${product.item}" return window is about to expire. 
Order Date: ${product.orderDate}
Days Since Order: ${daysSinceOrder}
Estimated Days Remaining: ${daysRemaining}

Please complete your review process or return the product if needed.`;
};

// Send email reminder using Firebase Functions
export const sendEmailReminder = async (
  userEmail: string, 
  product: Product
): Promise<boolean> => {
  try {
    console.log('📧 Sending return window reminder email via Firebase Functions...');
    
    const daysSinceOrder = calculateDaysSinceOrder(product.orderDate);
    const daysRemaining = Math.max(0, 30 - daysSinceOrder); // Assuming 30-day return window
    
    const functionUrl = getFunctionUrl();
    
    const payload = {
      userEmail,
      productItem: product.item,
      orderDate: product.orderDate,
      daysSinceOrder,
      daysRemaining,
    };
    
    console.log('🚀 Calling Firebase Function:', functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Firebase Function error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email reminder sent successfully via Firebase Functions');
      
      // Show browser notification as additional feedback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Return Window Alert Sent', {
          body: `Email reminder sent for "${product.item}".`,
          icon: '/favicon.ico'
        });
      }
      
      return true;
    } else {
      throw new Error(result.message || 'Firebase Function returned error');
    }
    
  } catch (error: any) {
    console.error('❌ Failed to send email reminder:', error);
    
    // Fallback to browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Email Failed - Return Window Alert', {
        body: `Failed to send email for "${product.item}". Check manually!`,
        icon: '/favicon.ico'
      });
    }
    
    return false;
  }
};

// Get Firebase Functions URL
const getFunctionUrl = (): string => {
  // Use the deployed Firebase Function URL directly
  // This is the actual deployed function URL from your Firebase deploy
  return 'https://sendreturnwindowreminder-bxwtawrqca-uc.a.run.app';
  
  // Alternative: Use the standard Firebase Functions URL format
  // return 'https://us-central1-productreview-52e51.cloudfunctions.net/sendReturnWindowReminder';
};

// Check and send reminders for all products that need them
export const checkAndSendReminders = async (
  products: Product[], 
  userEmail: string
): Promise<{ sent: number; failed: number }> => {
  const productsNeedingReminders = getProductsNeedingReminders(products);
  
  if (productsNeedingReminders.length === 0) {
    console.log('✅ No products need return window reminders');
    return { sent: 0, failed: 0 };
  }
  
  console.log(`📧 Sending reminders for ${productsNeedingReminders.length} products`);
  
  let sent = 0;
  let failed = 0;
  
  // Request notification permission if needed
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  
  for (const product of productsNeedingReminders) {
    const success = await sendEmailReminder(userEmail, product);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }
  
  console.log(`📊 Email reminder summary: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};