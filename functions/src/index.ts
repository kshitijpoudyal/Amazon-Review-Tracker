/**
 * Firebase Functions for Amazon Review Tracker
 * Email service using SendGrid
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import sgMail from "@sendgrid/mail";

// Initialize Firebase Admin
initializeApp();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// Define secrets for SendGrid
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const fromEmail = defineSecret("FROM_EMAIL");

export interface EmailRequest {
    to: string;
    subject: string;
    text: string;
    html?: string;
    templateData?: Record<string, unknown>;
}

export interface EmailResponse {
    success: boolean;
    message: string;
    error?: string;
}

// Firebase Function to send emails via SendGrid
export const sendEmail = onRequest(
    {
        secrets: [sendgridApiKey, fromEmail],
        cors: true,
    },
    async (request, response) => {
        // Only allow POST requests
        if (request.method !== "POST") {
            response.status(405).json({
                success: false,
                error: "Method not allowed. Use POST.",
            });
            return;
        }

        try {
            const { to, subject, text, html, templateData }: EmailRequest = request.body;

            // Validate required fields
            if (!to || !subject || !text) {
                response.status(400).json({
                    success: false,
                    error: "Missing required fields: to, subject, text",
                });
                return;
            }

            // Initialize SendGrid with API key
            const apiKey = sendgridApiKey.value();
            const senderEmail = fromEmail.value();

            if (!apiKey) {
                logger.error("SendGrid API key not configured");
                response.status(500).json({
                    success: false,
                    error: "Email service not configured",
                });
                return;
            }

            sgMail.setApiKey(apiKey);

            // Prepare email message
            const msg: sgMail.MailDataRequired = {
                to: to,
                from: {
                    email: senderEmail,
                    name: "Amazon Review Tracker",
                },
                subject: subject,
                text: text,
                html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${text.split("\n").map((line) => `<p>${line}</p>`).join("")}
        </div>`,
            };

            // Add template data if provided
            if (templateData) {
                (msg as any).dynamicTemplateData = templateData;
            }

            logger.info("Sending email via SendGrid", { to, subject });

            // Send email
            await sgMail.send(msg);

            logger.info("Email sent successfully", { to });

            const successResponse: EmailResponse = {
                success: true,
                message: "Email sent successfully",
            };

            response.status(200).json(successResponse);
        } catch (error: any) {
            logger.error("SendGrid error:", error);

            // Handle SendGrid specific errors
            let errorMessage = "Failed to send email";
            if (error.response) {
                const { message, code, response: sgResponse } = error;
                logger.error("SendGrid API Error:", {
                    message,
                    code,
                    statusCode: sgResponse?.statusCode,
                    body: sgResponse?.body,
                });
                errorMessage = `SendGrid error: ${message || "Unknown error"}`;
            }

            const errorResponse: EmailResponse = {
                success: false,
                message: errorMessage,
                error: error.message,
            };

            response.status(500).json(errorResponse);
        }
    }
);

// Specific function for return window reminders
export const sendReturnWindowReminder = onRequest(
    {
        secrets: [sendgridApiKey, fromEmail],
        cors: true,
    },
    async (request, response) => {
        if (request.method !== "POST") {
            response.status(405).json({
                success: false,
                error: "Method not allowed. Use POST.",
            });
            return;
        }

        try {
            const {
                userEmail,
                productItem,
                orderDate,
                daysSinceOrder,
                daysRemaining,
            } = request.body;

            if (!userEmail || !productItem || !orderDate || daysSinceOrder === undefined) {
                response.status(400).json({
                    success: false,
                    error: "Missing required fields",
                });
                return;
            }

            const subject = `⚠️ Return Window Alert - ${productItem}`;
            const text = `Your product return window is about to expire!

Product: ${productItem}
Order Date: ${orderDate}
Days Since Order: ${daysSinceOrder}
Estimated Days Remaining: ${Math.max(0, daysRemaining || 30 - daysSinceOrder)}

Please take action soon:
• Complete your product review if satisfied
• Process a return if not satisfied
• Update your product status in the tracker

Don't let your return window expire!

Best regards,
Amazon Review Tracker`;

            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e53e3e; margin-top: 0;">⚠️ Return Window Alert</h2>
            
            <div style="background-color: #fed7d7; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <strong>Your product return window is about to expire!</strong>
            </div>
            
            <h3 style="color: #2d3748; margin-bottom: 15px;">Product Details:</h3>
            <ul style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <li><strong>Product:</strong> ${productItem}</li>
              <li><strong>Order Date:</strong> ${orderDate}</li>
              <li><strong>Days Since Order:</strong> ${daysSinceOrder}</li>
              <li><strong>Estimated Days Remaining:</strong> ${Math.max(0, daysRemaining || 30 - daysSinceOrder)}</li>
            </ul>
            
            <h3 style="color: #2d3748; margin-bottom: 15px;">Action Required:</h3>
            <div style="background-color: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 5px 0;">✅ Complete your product review if satisfied</p>
              <p style="margin: 5px 0;">📦 Process a return if not satisfied</p>
              <p style="margin: 5px 0;">🔄 Update your product status in the tracker</p>
            </div>
            
            <p style="color: #e53e3e; font-weight: bold; text-align: center; margin: 25px 0;">
              Don't let your return window expire!
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
              <p>Best regards,<br><strong>Amazon Review Tracker</strong></p>
            </div>
          </div>
        </div>
      `;

            // Use the sendEmail function logic
            const apiKey = sendgridApiKey.value();
            const senderEmail = fromEmail.value();

            if (!apiKey) {
                logger.error("SendGrid API key not configured");
                response.status(500).json({
                    success: false,
                    error: "Email service not configured",
                });
                return;
            }

            sgMail.setApiKey(apiKey);

            const msg: sgMail.MailDataRequired = {
                to: userEmail,
                from: {
                    email: senderEmail,
                    name: "Amazon Review Tracker",
                },
                subject,
                text,
                html,
            };

            logger.info("Sending return window reminder", { userEmail, productItem });

            await sgMail.send(msg);

            logger.info("Return window reminder sent successfully", { userEmail, productItem });

            response.status(200).json({
                success: true,
                message: "Return window reminder sent successfully",
            });
        } catch (error: any) {
            logger.error("Error sending return window reminder:", error);
            response.status(500).json({
                success: false,
                message: "Failed to send return window reminder",
                error: error.message,
            });
        }
    }
);

// Scheduled function to check all users daily at 9 AM EST
export const dailyReturnWindowCheck = onSchedule(
    {
        schedule: "0 14 * * *", // 9 AM EST = 2 PM UTC (14:00)
        timeZone: "America/New_York", // EST timezone
        secrets: [sendgridApiKey, fromEmail],
    },
    async (event) => {
        logger.info("🕘 Daily return window check started at 9 AM EST");

        const db = getFirestore();
        let totalEmailsSent = 0;
        let totalEmailsFailed = 0;

        try {
            // Get all users from Firestore
            const usersSnapshot = await db.collection("users").get();
            
            if (usersSnapshot.empty) {
                logger.info("No users found in database");
                return;
            }

            logger.info(`Found ${usersSnapshot.size} users to check`);

            // Process each user
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const userEmail = userData.email;
                
                if (!userEmail) {
                    logger.warn(`User ${userDoc.id} has no email address`);
                    continue;
                }

                // Get user's products
                const productsSnapshot = await db
                    .collection("users")
                    .doc(userDoc.id)
                    .collection("products")
                    .get();

                if (productsSnapshot.empty) {
                    logger.info(`User ${userEmail} has no products`);
                    continue;
                }

                const products = productsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        item: data.item || 'Unknown Product',
                        orderDate: data.orderDate,
                        isVoid: data.isVoid,
                        reviewLive: data.reviewLive,
                        ...data
                    };
                });

                logger.info(`Checking ${products.length} products for user ${userEmail}`);

                // Check each product for return window alerts
                for (const product of products) {
                    if (needsReturnWindowReminder(product)) {
                        try {
                            await sendReturnWindowEmail(userEmail, product);
                            totalEmailsSent++;
                            logger.info(`✅ Sent reminder for ${product.item} to ${userEmail}`);
                        } catch (error) {
                            totalEmailsFailed++;
                            logger.error(`❌ Failed to send reminder for ${product.item} to ${userEmail}:`, error);
                        }
                    }
                }
            }

            logger.info(`🎯 Daily check completed: ${totalEmailsSent} emails sent, ${totalEmailsFailed} failed`);

        } catch (error) {
            logger.error("❌ Error in daily return window check:", error);
        }
    }
);

// Helper function to check if product needs reminder
function needsReturnWindowReminder(product: any): boolean {
    if (!product.orderDate) return false;

    const orderDateObj = new Date(product.orderDate);
    const today = new Date();
    const timeDifference = today.getTime() - orderDateObj.getTime();
    const daysSinceOrder = Math.floor(timeDifference / (1000 * 3600 * 24));

    // Check product status
    const isVoid = product.isVoid;
    const isComplete = product.reviewLive; // Complete when review is live
    
    // Send reminder if order is more than 20 days old and not complete/void
    return daysSinceOrder > 20 && !isComplete && !isVoid;
}

// Helper function to send return window email
async function sendReturnWindowEmail(userEmail: string, product: any): Promise<void> {
    const apiKey = sendgridApiKey.value();
    const senderEmail = fromEmail.value();

    if (!apiKey) {
        throw new Error("SendGrid API key not configured");
    }

    sgMail.setApiKey(apiKey);

    const orderDateObj = new Date(product.orderDate);
    const today = new Date();
    const daysSinceOrder = Math.floor((today.getTime() - orderDateObj.getTime()) / (1000 * 3600 * 24));
    const daysRemaining = Math.max(0, 30 - daysSinceOrder);

    const subject = `⚠️ Return Window Alert - ${product.item}`;
    const text = `Your product return window is about to expire!

Product: ${product.item}
Order Date: ${product.orderDate}
Days Since Order: ${daysSinceOrder}
Days Remaining: ${daysRemaining}

Please take action soon to avoid missing the return window.

Best regards,
Amazon Review Tracker`;

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #e53e3e; margin-top: 0;">⚠️ Return Window Alert</h2>
    
    <div style="background-color: #fed7d7; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <strong>Your product return window is about to expire!</strong>
    </div>
    
    <h3 style="color: #2d3748;">Product Details:</h3>
    <ul style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <li><strong>Product:</strong> ${product.item}</li>
      <li><strong>Order Date:</strong> ${product.orderDate}</li>
      <li><strong>Days Since Order:</strong> ${daysSinceOrder}</li>
      <li><strong>Days Remaining:</strong> ${daysRemaining}</li>
    </ul>
    
    <div style="background-color: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p>✅ Complete your product review if satisfied</p>
      <p>📦 Process a return if not satisfied</p>
      <p>🔄 Update your product status in the tracker</p>
    </div>
    
    <p style="color: #e53e3e; font-weight: bold; text-align: center;">
      Don't let your return window expire!
    </p>
  </div>
</div>`;

    const msg = {
        to: userEmail,
        from: {
            email: senderEmail,
            name: "Amazon Review Tracker",
        },
        subject,
        text,
        html,
    };

    await sgMail.send(msg);
}
