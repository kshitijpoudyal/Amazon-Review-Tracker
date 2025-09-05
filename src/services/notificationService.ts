import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../types/Product';
import { getStagnantProducts, shouldSendNotification } from '../utils/statusTracker';
import { 
  sendStagnantProductEmail, 
  formatStagnantProductsForEmail,
  EmailConfig,
  StagnantProductNotification 
} from '../utils/emailService';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
}

/**
 * Service to handle automatic notifications for stagnant products
 */
export class StagnantProductNotificationService {
  private emailConfig: EmailConfig;

  constructor(emailConfig: EmailConfig) {
    this.emailConfig = emailConfig;
  }

  /**
   * Checks all users for stagnant products and sends notifications
   */
  async checkAndNotifyAllUsers(): Promise<void> {
    try {
      console.log('🔍 Checking all users for stagnant products...');
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];

      console.log(`👥 Found ${users.length} users to check`);

      for (const user of users) {
        await this.checkAndNotifyUser(user);
      }

      console.log('✅ Completed checking all users for stagnant products');
    } catch (error) {
      console.error('❌ Error checking users for stagnant products:', error);
    }
  }

  /**
   * Checks a specific user for stagnant products and sends notification if needed
   */
  async checkAndNotifyUser(user: UserProfile): Promise<void> {
    try {
      if (!user.email) {
        console.log(`⚠️ Skipping user ${user.uid} - no email address`);
        return;
      }

      console.log(`🔍 Checking user: ${user.email}`);

      // Get user's products
      const productsSnapshot = await getDocs(
        collection(db, 'users', user.uid, 'products')
      );

      const products: Product[] = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      if (products.length === 0) {
        console.log(`📭 User ${user.email} has no products`);
        return;
      }

      // Find stagnant products (unchanged for 14+ days)
      const stagnantProducts = getStagnantProducts(products, 14);

      if (stagnantProducts.length === 0) {
        console.log(`✅ User ${user.email} has no stagnant products`);
        return;
      }

      // Check if we should send a notification
      if (!shouldSendNotification(stagnantProducts, 7)) {
        console.log(`⏰ User ${user.email} has stagnant products but notification was sent recently`);
        return;
      }

      // Prepare notification
      const notification: StagnantProductNotification = {
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        stagnantProducts: formatStagnantProductsForEmail(stagnantProducts)
      };

      // Send email notification
      const emailSent = await sendStagnantProductEmail(notification, this.emailConfig);

      if (emailSent) {
        // Update lastNotificationSent for all stagnant products
        await this.updateNotificationTimestamps(user.uid, stagnantProducts);
        console.log(`📧 Sent stagnant product notification to ${user.email} for ${stagnantProducts.length} products`);
      } else {
        console.error(`❌ Failed to send notification to ${user.email}`);
      }

    } catch (error) {
      console.error(`❌ Error checking user ${user.email}:`, error);
    }
  }

  /**
   * Updates the lastNotificationSent timestamp for products
   */
  private async updateNotificationTimestamps(userId: string, products: Product[]): Promise<void> {
    const now = new Date().toISOString();
    
    const updatePromises = products.map(async (product) => {
      if (!product.id) return;
      
      const productRef = doc(db, 'users', userId, 'products', product.id);
      await updateDoc(productRef, {
        lastNotificationSent: now
      });
    });

    await Promise.all(updatePromises);
  }

  /**
   * Gets stagnant products for a specific user (for testing/debugging)
   */
  async getUserStagnantProducts(userId: string): Promise<Product[]> {
    try {
      const productsSnapshot = await getDocs(
        collection(db, 'users', userId, 'products')
      );

      const products: Product[] = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      return getStagnantProducts(products, 14);
    } catch (error) {
      console.error('❌ Error getting user stagnant products:', error);
      return [];
    }
  }
}
