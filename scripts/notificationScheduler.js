import admin from 'firebase-admin';
import cron from 'node-cron';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = resolve(__dirname, '../firebase-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Email configuration
const EMAIL_CONFIG = {
  apiKey: process.env.EMAIL_API_KEY || 'your-email-api-key',
  fromEmail: process.env.FROM_EMAIL || 'noreply@amazonreviewtracker.com',
  fromName: process.env.FROM_NAME || 'Amazon Review Tracker'
};

/**
 * Product status utilities (server-side implementation)
 */
class ProductStatusUtilsServer {
  static getProductStatusType(product) {
    if (product.isVoid) return 'void';
    
    if (product.orderPlaced && 
        product.orderDelivered && 
        product.reviewAdded && 
        product.reviewLive && 
        product.reviewSSSent &&
        product.paid !== null &&
        product.received !== null) {
      return 'complete';
    }

    if (product.orderPlaced && 
        product.orderDelivered && 
        product.reviewAdded && 
        product.reviewLive && 
        product.reviewSSSent &&
        product.paid !== null &&
        product.received == null) {
      return 'refund-pending';
    }

    if (product.orderPlaced && 
        product.orderDelivered && 
        product.reviewAdded && 
        product.reviewLive && 
        !product.reviewSSSent &&
        product.paid !== null) {
      return 'send-screenshot';
    }

    if (product.orderPlaced && 
        product.orderDelivered && 
        product.reviewAdded && 
        !product.reviewLive &&
        !product.reviewSSSent &&
        product.paid !== null) {
      return 'review-pending';
    }

    if (product.orderPlaced && 
        product.orderDelivered && 
        !product.reviewAdded && 
        !product.reviewLive && 
        !product.reviewSSSent &&
        product.paid !== null) {
      return 'add-review';
    }

    if (product.orderPlaced && 
        !product.orderDelivered && 
        !product.reviewAdded && 
        !product.reviewLive && 
        !product.reviewSSSent &&
        product.paid !== null &&
        product.received === null) {
      return 'order-placed';
    }

    return 'unknown';
  }

  static getStatusDisplay(statusType) {
    const statusMap = {
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
  }

  static getProductStatus(product) {
    const statusType = this.getProductStatusType(product);
    const display = this.getStatusDisplay(statusType);
    return { type: statusType, ...display };
  }
}

/**
 * Server-side notification service
 */
class NotificationServiceServer {
  constructor() {
    this.db = db;
  }

  async checkAndNotifyAllUsers() {
    try {
      console.log('🔍 Checking all users for stagnant products...');
      
      const usersSnapshot = await this.db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      console.log(`👥 Found ${users.length} users to check`);

      for (const user of users) {
        await this.checkAndNotifyUser(user);
      }

      console.log('✅ Completed checking all users for stagnant products');
    } catch (error) {
      console.error('❌ Error checking users for stagnant products:', error);
    }
  }

  async checkAndNotifyUser(user) {
    try {
      if (!user.email) {
        console.log(`⚠️ Skipping user ${user.uid} - no email address`);
        return;
      }

      console.log(`🔍 Checking user: ${user.email}`);

      const productsSnapshot = await this.db
        .collection('users')
        .doc(user.uid)
        .collection('products')
        .get();

      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (products.length === 0) {
        console.log(`📭 User ${user.email} has no products`);
        return;
      }

      const stagnantProducts = this.getStagnantProducts(products, 14);

      if (stagnantProducts.length === 0) {
        console.log(`✅ User ${user.email} has no stagnant products`);
        return;
      }

      if (!this.shouldSendNotification(stagnantProducts, 7)) {
        console.log(`⏰ User ${user.email} has stagnant products but notification was sent recently`);
        return;
      }

      const notification = {
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        stagnantProducts: this.formatStagnantProductsForEmail(stagnantProducts)
      };

      const emailSent = await this.sendStagnantProductEmail(notification);

      if (emailSent) {
        await this.updateNotificationTimestamps(user.uid, stagnantProducts);
        console.log(`📧 Sent stagnant product notification to ${user.email} for ${stagnantProducts.length} products`);
      } else {
        console.error(`❌ Failed to send notification to ${user.email}`);
      }

    } catch (error) {
      console.error(`❌ Error checking user ${user.email}:`, error);
    }
  }

  getStagnantProducts(products, daysThreshold = 14) {
    return products.filter(product => {
      if (product.isVoid) return false;
      
      if (!product.statusLastChanged) return false;
      
      const statusChangeDate = new Date(product.statusLastChanged);
      const now = new Date();
      const daysDifference = (now.getTime() - statusChangeDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysDifference >= daysThreshold;
    });
  }

  shouldSendNotification(stagnantProducts, daysSinceLastNotification = 7) {
    if (stagnantProducts.length === 0) return false;
    
    return stagnantProducts.some(product => {
      if (!product.lastNotificationSent) return true;
      
      const lastNotificationDate = new Date(product.lastNotificationSent);
      const now = new Date();
      const daysSinceLastNotif = (now.getTime() - lastNotificationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSinceLastNotif >= daysSinceLastNotification;
    });
  }

  formatStagnantProductsForEmail(products) {
    return products.map(product => {
      const status = ProductStatusUtilsServer.getProductStatus(product);
      const daysSinceLastChange = product.statusLastChanged 
        ? Math.floor((new Date().getTime() - new Date(product.statusLastChanged).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        item: product.item,
        status: status.label,
        daysSinceLastChange,
        url: product.url
      };
    });
  }

  async sendStagnantProductEmail(notification) {
    try {
      // For now, just log the notification
      // In production, you would integrate with SendGrid, AWS SES, or another email service
      console.log('📧 Email notification to send:', {
        to: notification.userEmail,
        subject: `⚠️ ${notification.stagnantProducts.length} Products Need Your Attention`,
        stagnantProductsCount: notification.stagnantProducts.length,
        products: notification.stagnantProducts.map(p => `${p.item} (${p.status}, ${p.daysSinceLastChange} days)`)
      });
      
      // TODO: Implement actual email sending
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(EMAIL_CONFIG.apiKey);
      // 
      // const msg = {
      //   to: notification.userEmail,
      //   from: EMAIL_CONFIG.fromEmail,
      //   subject: `⚠️ ${notification.stagnantProducts.length} Products Need Your Attention`,
      //   html: this.generateEmailHTML(notification)
      // };
      // 
      // await sgMail.send(msg);
      
      return true; // Return true for demo purposes
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  async updateNotificationTimestamps(userId, products) {
    const now = new Date().toISOString();
    const batch = this.db.batch();
    
    products.forEach(product => {
      if (product.id) {
        const productRef = this.db
          .collection('users')
          .doc(userId)
          .collection('products')
          .doc(product.id);
        
        batch.update(productRef, {
          lastNotificationSent: now
        });
      }
    });

    await batch.commit();
  }
}

// Initialize the notification service
const notificationService = new NotificationServiceServer();

// Schedule the notification check to run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running scheduled notification check...');
  await notificationService.checkAndNotifyAllUsers();
}, {
  scheduled: true,
  timezone: "America/New_York" // Adjust timezone as needed
});

// Also run on startup for testing
console.log('🚀 Notification service started');
console.log('📅 Scheduled to run daily at 9:00 AM');

// For manual testing, uncomment the line below:
// notificationService.checkAndNotifyAllUsers();

// Keep the process running
process.on('SIGINT', () => {
  console.log('🛑 Notification service shutting down...');
  process.exit(0);
});

export default notificationService;
