import { Product } from '../types/Product';
import { getProductStatus } from './productStatus';

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface StagnantProductNotification {
  userEmail: string;
  userName: string;
  stagnantProducts: Array<{
    item: string;
    status: string;
    daysSinceLastChange: number;
    url?: string;
  }>;
}

/**
 * Formats stagnant products for email notification
 */
export const formatStagnantProductsForEmail = (products: Product[]): StagnantProductNotification['stagnantProducts'] => {
  return products.map(product => {
    const status = getProductStatus(product);
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
};

/**
 * Generates HTML email template for stagnant product notification
 */
export const generateStagnantProductEmailHTML = (notification: StagnantProductNotification): string => {
  const { userName, stagnantProducts } = notification;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stagnant Products Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .product-card { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .product-name { font-weight: bold; font-size: 16px; color: #495057; margin-bottom: 8px; }
        .product-status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 8px; }
        .product-days { color: #6c757d; font-size: 14px; }
        .product-url { margin-top: 10px; }
        .product-url a { color: #667eea; text-decoration: none; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        .alert-icon { font-size: 48px; margin-bottom: 10px; }
        
        /* Status-specific colors */
        .status-order-placed { background-color: #e7e3ff; color: #5a67d8; }
        .status-add-review { background-color: #fed7aa; color: #c05621; }
        .status-review-pending { background-color: #fef3cd; color: #b45309; }
        .status-send-screenshot { background-color: #dbeafe; color: #1e40af; }
        .status-refund-pending { background-color: #bfdbfe; color: #1d4ed8; }
        .status-complete { background-color: #d1fae5; color: #065f46; }
        .status-void { background-color: #f3f4f6; color: #374151; }
        .status-unknown { background-color: #f3f4f6; color: #374151; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-icon">⚠️</div>
          <h1>Products Need Your Attention</h1>
          <p>Hello ${userName}, some of your products haven't been updated in 2+ weeks</p>
        </div>
        
        <div class="content">
          <p>The following ${stagnantProducts.length} product${stagnantProducts.length > 1 ? 's' : ''} ${stagnantProducts.length > 1 ? 'have' : 'has'} been in the same status for more than 2 weeks:</p>
          
          ${stagnantProducts.map(product => `
            <div class="product-card">
              <div class="product-name">${product.item}</div>
              <div class="product-status status-${product.status.toLowerCase().replace(/\s+/g, '-')}">${product.status}</div>
              <div class="product-days">No changes for ${product.daysSinceLastChange} days</div>
              ${product.url ? `<div class="product-url"><a href="${product.url}" target="_blank">View Product →</a></div>` : ''}
            </div>
          `).join('')}
          
          <p style="margin-top: 30px;">
            <strong>What to do next:</strong><br>
            • Review each product's current status<br>
            • Update the status if any progress has been made<br>
            • Take necessary actions to move products forward<br>
            • Consider marking products as void if they're no longer relevant
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${window.location.origin}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">View Dashboard</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you have products that haven't been updated recently.</p>
          <p>This is an automated notification from Amazon Review Tracker.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates plain text email for stagnant product notification
 */
export const generateStagnantProductEmailText = (notification: StagnantProductNotification): string => {
  const { userName, stagnantProducts } = notification;
  
  return `
Hello ${userName},

Some of your products in the Amazon Review Tracker haven't been updated in 2+ weeks and may need your attention.

PRODUCTS NEEDING ATTENTION (${stagnantProducts.length}):

${stagnantProducts.map(product => `
• ${product.item}
  Status: ${product.status}
  No changes for: ${product.daysSinceLastChange} days
  ${product.url ? `URL: ${product.url}` : ''}
`).join('\n')}

WHAT TO DO NEXT:
• Review each product's current status
• Update the status if any progress has been made  
• Take necessary actions to move products forward
• Consider marking products as void if they're no longer relevant

Visit your dashboard: ${window.location.origin}

---
This is an automated notification from Amazon Review Tracker.
You're receiving this because you have products that haven't been updated recently.
  `.trim();
};

/**
 * Sends email notification using a third-party email service
 * This is a placeholder - you'll need to implement with your preferred email service
 */
export const sendStagnantProductEmail = async (
  notification: StagnantProductNotification,
  config: EmailConfig
): Promise<boolean> => {
  try {
    // This is a placeholder implementation
    // You would replace this with your actual email service (SendGrid, AWS SES, etc.)
    
    const emailData = {
      from: {
        email: config.fromEmail,
        name: config.fromName
      },
      to: notification.userEmail,
      subject: `⚠️ ${notification.stagnantProducts.length} Products Need Your Attention - Amazon Review Tracker`,
      html: generateStagnantProductEmailHTML(notification),
      text: generateStagnantProductEmailText(notification)
    };
    
    console.log('📧 Would send email:', emailData);
    
    // Example using fetch to send to an email service endpoint
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${config.apiKey}`
    //   },
    //   body: JSON.stringify(emailData)
    // });
    // 
    // return response.ok;
    
    // For now, just log and return true
    return true;
  } catch (error) {
    console.error('❌ Error sending stagnant product email:', error);
    return false;
  }
};
