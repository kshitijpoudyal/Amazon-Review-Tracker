/**
 * Firebase Functions for Amazon Review Tracker
 * Email service using SendGrid
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import sgMail from "@sendgrid/mail";
import webpush from "web-push";
import { OAuth2Client } from "google-auth-library";

// Initialize Firebase Admin
initializeApp();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// ─── Notification thresholds (edit these to adjust when emails fire) ─────────
const THRESHOLDS = {
    returnWindowAlert: 0,      // days since order → return window warning
    returnWindowDays: 30,       // assumed Amazon return window length
    refundNudge: 25,            // days since order → refund/return nudge email
    statusStuck: {
        "add-review": 5,
        "review-pending": 10,
        "send-screenshot": 3,
        "refund-pending": 14,
    } as Record<string, number>,
};
// ─────────────────────────────────────────────────────────────────────────────

// Define secrets for SendGrid
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const fromEmail = defineSecret("FROM_EMAIL");

// Define secrets for Web Push (VAPID)
const vapidPublicKey = defineSecret("VAPID_PUBLIC_KEY");
const vapidPrivateKey = defineSecret("VAPID_PRIVATE_KEY");
const vapidSubject = defineSecret("VAPID_SUBJECT");

// Define secrets for Gmail OAuth (review-live watcher)
const gmailOAuthClientId = defineSecret("GMAIL_OAUTH_CLIENT_ID");
const gmailOAuthClientSecret = defineSecret("GMAIL_OAUTH_CLIENT_SECRET");
const gmailOAuthRedirectUri = defineSecret("GMAIL_OAUTH_REDIRECT_URI");
// Base URL of the deployed frontend, e.g. https://your-app.vercel.app — used to
// build the redirect target after the OAuth callback completes.
const appBaseUrl = defineSecret("APP_BASE_URL");

// Gmail search query per retailer — tune these once real subject lines are confirmed.
// `after:` (epoch seconds) is appended at query time based on lastCheckedAt.
const RETAILER_EMAIL_PATTERNS: Record<string, string> = {
    amazon: "from:(amazon.com) subject:(review)",
};

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
Estimated Days Remaining: ${Math.max(0, daysRemaining || THRESHOLDS.returnWindowDays - daysSinceOrder)}

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
              <li><strong>Estimated Days Remaining:</strong> ${Math.max(0, daysRemaining || THRESHOLDS.returnWindowDays - daysSinceOrder)}</li>
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

// Manual trigger for testing — POST /triggerStatusCheck (remove before production)
export const triggerStatusCheck = onRequest(
    { secrets: [sendgridApiKey, fromEmail, vapidPublicKey, vapidPrivateKey, vapidSubject] },
    async (request, response) => {
        if (request.method !== "POST") {
            response.status(405).json({ error: "Use POST" });
            return;
        }

        const db = getFirestore();
        configureWebPush();
        let totalEmailsSent = 0;
        let totalEmailsFailed = 0;
        let totalPushSent = 0;
        let totalPushFailed = 0;

        const usersSnapshot = await db.collection("users").get();

        for (const userDoc of usersSnapshot.docs) {
            const userEmail = userDoc.data().email;
            if (!userEmail) continue;

            const productsSnapshot = await db
                .collection("users").doc(userDoc.id).collection("products").get();

            for (const productDoc of productsSnapshot.docs) {
                const product = { id: productDoc.id, ...productDoc.data() };
                const orderAge = orderAgeAlert(product);
                if (orderAge !== null) {
                    try {
                        await sendOrderAgeAlertEmail(userEmail, product, orderAge);
                        totalEmailsSent++;
                        logger.info(`✅ [test] Sent order-age alert for ${(product as any).item}`);
                    } catch (err) {
                        totalEmailsFailed++;
                        logger.error(`❌ [test] Failed order-age for ${(product as any).item}:`, err);
                    }
                } else {
                    const stuck = daysStuckInStatus(product);
                    if (stuck && shouldNotifyStuckStatus(product)) {
                        try {
                            const wasSent = await sendStuckStatusPush(db, userDoc.id, productDoc.ref, product, stuck.status, stuck.days);
                            if (wasSent) {
                                totalPushSent++;
                                logger.info(`✅ [test] Sent stuck push for ${(product as any).item}`);
                            }
                        } catch (err) {
                            totalPushFailed++;
                            logger.error(`❌ [test] Failed stuck push for ${(product as any).item}:`, err);
                        }
                    }
                }
            }
        }

        response.status(200).json({ totalEmailsSent, totalEmailsFailed, totalPushSent, totalPushFailed });
    }
);

// Scheduled function to check all users daily at 9 AM EST
export const dailyReturnWindowCheck = onSchedule(
    {
        schedule: "0 14 * * *", // 9 AM EST = 2 PM UTC (14:00)
        timeZone: "America/New_York", // EST timezone
        secrets: [sendgridApiKey, fromEmail, vapidPublicKey, vapidPrivateKey, vapidSubject],
    },
    async (event) => {
        logger.info("🕘 Daily return window check started at 9 AM EST");

        const db = getFirestore();
        configureWebPush();
        let totalEmailsSent = 0;
        let totalEmailsFailed = 0;
        let totalPushSent = 0;
        let totalPushFailed = 0;

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

                logger.info(`Checking ${productsSnapshot.size} products for user ${userEmail}`);

                // Check each product for return window alerts and stuck-status alerts
                for (const productDoc of productsSnapshot.docs) {
                    const data = productDoc.data();
                    const product = {
                        id: productDoc.id,
                        item: data.item || 'Unknown Product',
                        orderDate: data.orderDate,
                        isVoid: data.isVoid,
                        reviewLive: data.reviewLive,
                        ...data
                    };
                    if (needsReturnWindowReminder(product)) {
                        try {
                            await sendReturnWindowEmail(userEmail, product);
                            totalEmailsSent++;
                            logger.info(`✅ Sent return-window reminder for ${product.item} to ${userEmail}`);
                        } catch (error) {
                            totalEmailsFailed++;
                            logger.error(`❌ Failed to send return-window reminder for ${product.item}:`, error);
                        }
                    }

                    const orderAge = orderAgeAlert(product);
                    if (orderAge !== null) {
                        try {
                            await sendOrderAgeAlertEmail(userEmail, product, orderAge);
                            totalEmailsSent++;
                            logger.info(`✅ Sent order-age alert for ${product.item} (${orderAge}d) to ${userEmail}`);
                        } catch (error) {
                            totalEmailsFailed++;
                            logger.error(`❌ Failed to send order-age alert for ${product.item}:`, error);
                        }
                    } else {
                        const stuck = daysStuckInStatus(product);
                        if (stuck && shouldNotifyStuckStatus(product)) {
                            try {
                                const wasSent = await sendStuckStatusPush(db, userDoc.id, productDoc.ref, product, stuck.status, stuck.days);
                                if (wasSent) {
                                    totalPushSent++;
                                    logger.info(`✅ Sent stuck-status push for ${product.item} (${stuck.status}, ${stuck.days}d) to ${userEmail}`);
                                }
                            } catch (error) {
                                totalPushFailed++;
                                logger.error(`❌ Failed to send stuck-status push for ${product.item}:`, error);
                            }
                        }
                    }
                }
            }

            logger.info(`🎯 Daily check completed: ${totalEmailsSent} emails sent, ${totalEmailsFailed} failed, ${totalPushSent} pushes sent, ${totalPushFailed} failed`);

        } catch (error) {
            logger.error("❌ Error in daily return window check:", error);
        }
    }
);

// Days since order date before sending the refund/return nudge

// Returns days since order if alert should fire, null otherwise
function orderAgeAlert(product: any): number | null {
    if (!product.orderDate) return null;
    const isComplete = product.reviewLive;
    const isVoid = product.isVoid;
    if (isComplete || isVoid) return null;

    const days = Math.floor(
        (new Date().getTime() - new Date(product.orderDate).getTime()) / (1000 * 3600 * 24)
    );
    return days >= THRESHOLDS.refundNudge ? days : null;
}

async function sendOrderAgeAlertEmail(userEmail: string, product: any, daysSinceOrder: number): Promise<void> {
    const apiKey = sendgridApiKey.value();
    const senderEmail = fromEmail.value();
    if (!apiKey) throw new Error("SendGrid API key not configured");

    sgMail.setApiKey(apiKey);

    const status = STATUS_LABELS[product.lastStatus] ?? product.lastStatus ?? "Unknown";
    const subject = `Action Required: Refund Not Yet Received — ${product.item}`;

    const text = `This is a reminder that it has been ${daysSinceOrder} days since your order was placed and a refund has not yet been recorded for the following item.

Product: ${product.item}
Order Date: ${product.orderDate}
Days Since Order: ${daysSinceOrder}
Current Status: ${status}
Product URL: ${product.url ?? "Not available"}

Amazon's standard return window is 30 days. We recommend reviewing this order and initiating a return if you have not already done so.

Steps to take:
  1. Visit the product page: ${product.url ?? "URL not available"}
  2. If a return has not been started, initiate one before the return window closes.
  3. Once the refund is processed, update the status in Amazon Review Tracker.

If you believe this item is already resolved, please mark it as complete in the tracker to stop receiving these reminders.

Best regards,
Amazon Review Tracker`;

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #2d3748; margin-top: 0;">Refund Not Yet Received</h2>

    <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <strong>It has been ${daysSinceOrder} days since this order was placed and no refund has been recorded.</strong>
      Amazon's standard return window is 30 days — please act soon.
    </div>

    <h3 style="color: #2d3748;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; background-color: #f7fafc; border-radius: 5px; overflow: hidden;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 15px; font-weight: bold; width: 40%;">Product</td>
        <td style="padding: 10px 15px;">${product.item}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 15px; font-weight: bold;">Order Date</td>
        <td style="padding: 10px 15px;">${product.orderDate}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 15px; font-weight: bold;">Days Since Order</td>
        <td style="padding: 10px 15px;">${daysSinceOrder}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 15px; font-weight: bold;">Current Status</td>
        <td style="padding: 10px 15px;">${status}</td>
      </tr>
      <tr>
        <td style="padding: 10px 15px; font-weight: bold;">Product URL</td>
        <td style="padding: 10px 15px;">${product.url ? `<a href="${product.url}" style="color: #3182ce; word-break: break-all;">${product.url}</a>` : "Not available"}</td>
      </tr>
    </table>

    <h3 style="color: #2d3748; margin-top: 25px;">Recommended Actions</h3>
    <ol style="background-color: #f7fafc; padding: 15px 15px 15px 35px; border-radius: 5px; margin: 15px 0; line-height: 1.8;">
      <li>Visit the product page: ${product.url ? `<a href="${product.url}" style="color: #3182ce;">${product.url}</a>` : "URL not available"}</li>
      <li>If a return has not been started, initiate one before the return window closes.</li>
      <li>Once the refund is processed, update the status in Amazon Review Tracker.</li>
    </ol>

    <p style="color: #718096; font-size: 13px; margin-top: 20px;">
      If this item is already resolved, please mark it as <strong>Complete</strong> in the tracker to stop receiving these reminders.
    </p>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
      Best regards,<br><strong>Amazon Review Tracker</strong>
    </div>
  </div>
</div>`;

    await sgMail.send({
        to: userEmail,
        from: { email: senderEmail, name: "Amazon Review Tracker" },
        subject,
        text,
        html,
    });
}


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
    return daysSinceOrder > THRESHOLDS.returnWindowAlert && !isComplete && !isVoid;
}

// Returns number of days stuck in current status, or null if not applicable
function daysStuckInStatus(product: any): { status: string; days: number } | null {
    const status: string = product.lastStatus;
    if (!status || status === "complete" || status === "void") return null;
    if (!(status in THRESHOLDS.statusStuck)) return null;
    if (!product.statusChangedAt) return null;

    const changedAt = new Date(product.statusChangedAt);
    const today = new Date();
    const days = Math.floor((today.getTime() - changedAt.getTime()) / (1000 * 3600 * 24));
    const threshold = THRESHOLDS.statusStuck[status];

    return days >= threshold ? { status, days } : null;
}

const STATUS_LABELS: Record<string, string> = {
    "order-placed": "Order Placed",
    "add-review": "Add Review",
    "review-pending": "Review Pending",
    "send-screenshot": "Send Screenshot",
    "refund-pending": "Refund Pending",
};

// True if this stuck period hasn't been push-notified yet (i.e. no notification
// since the status last changed) — keeps stuck alerts to once per stuck period.
function shouldNotifyStuckStatus(product: any): boolean {
    if (!product.statusChangedAt) return true;
    if (!product.lastStuckNotifiedAt) return true;
    return new Date(product.lastStuckNotifiedAt).getTime() < new Date(product.statusChangedAt).getTime();
}

let webPushConfigured = false;
function configureWebPush(): void {
    if (webPushConfigured) return;
    const subject = vapidSubject.value();
    const publicKey = vapidPublicKey.value();
    const privateKey = vapidPrivateKey.value();
    if (!subject || !publicKey || !privateKey) {
        logger.warn("VAPID secrets not configured — push notifications will fail to send");
        return;
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    webPushConfigured = true;
}

interface PushPayload {
    title: string;
    body: string;
    url?: string;
    tag?: string;
}

// Sends a push to every device the user has subscribed on, cleaning up dead
// subscriptions along the way. Returns false (without erroring) if the user
// has no active subscriptions yet — that's a normal "not opted in" case, not
// a failure.
async function sendPushToAllSubscriptions(
    db: Firestore,
    userId: string,
    payload: PushPayload
): Promise<boolean> {
    const subsSnapshot = await db.collection("users").doc(userId).collection("pushSubscriptions").get();
    if (subsSnapshot.empty) return false;

    const serialized = JSON.stringify(payload);
    let sent = 0;
    for (const subDoc of subsSnapshot.docs) {
        const sub = subDoc.data() as { endpoint: string; keys: { p256dh: string; auth: string } };
        try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, serialized);
            sent++;
        } catch (err: any) {
            if (err?.statusCode === 404 || err?.statusCode === 410) {
                await subDoc.ref.delete();
            } else {
                logger.error(`Push send failed for user ${userId}:`, err);
            }
        }
    }

    return sent > 0;
}

// Sends the stuck-status push to every device the user has subscribed on.
// Returns false (without erroring) if the user has no active subscriptions yet.
async function sendStuckStatusPush(
    db: Firestore,
    userId: string,
    productRef: FirebaseFirestore.DocumentReference,
    product: any,
    status: string,
    days: number
): Promise<boolean> {
    const statusLabel = STATUS_LABELS[status] ?? status;
    const wasSent = await sendPushToAllSubscriptions(db, userId, {
        title: `⏰ Stuck in "${statusLabel}"`,
        body: `${product.item} has been in "${statusLabel}" for ${days} days.`,
        url: "/products",
        tag: `stuck-${productRef.id}`,
    });

    if (wasSent) {
        await productRef.set({ lastStuckNotifiedAt: new Date().toISOString() }, { merge: true });
    }
    return wasSent;
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
    const daysRemaining = Math.max(0, THRESHOLDS.returnWindowDays - daysSinceOrder);

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

// ─── Gmail "review is live" watcher ───────────────────────────────────────
// Watches each connected user's Gmail for retailer emails that look like a
// review confirmation, and pushes a notification when one shows up. This is
// notify-only by design — it never tries to auto-match the email to a
// specific product, since matching by name from email text is too fragile
// to trust unattended.

function gmailOAuthClient(): OAuth2Client {
    return new OAuth2Client(
        gmailOAuthClientId.value(),
        gmailOAuthClientSecret.value(),
        gmailOAuthRedirectUri.value()
    );
}

// Redirect the user's browser here (with ?uid=<uid>) to start the Gmail OAuth flow.
export const gmailOAuthStart = onRequest(
    { secrets: [gmailOAuthClientId, gmailOAuthClientSecret, gmailOAuthRedirectUri] },
    async (request, response) => {
        const uid = String(request.query.uid || "");
        if (!uid) {
            response.status(400).send("Missing uid");
            return;
        }

        const url = gmailOAuthClient().generateAuthUrl({
            access_type: "offline",
            // "select_account" forces Google's account chooser instead of silently
            // reusing whatever account is already signed into the device/browser.
            prompt: "select_account consent",
            scope: ["https://www.googleapis.com/auth/gmail.readonly"],
            state: uid,
        });

        response.redirect(url);
    }
);

// Handles Google's redirect back after consent, exchanges the code for
// tokens, and stores them for the scheduled checker to use.
export const gmailOAuthCallback = onRequest(
    { secrets: [gmailOAuthClientId, gmailOAuthClientSecret, gmailOAuthRedirectUri, appBaseUrl] },
    async (request, response) => {
        const code = String(request.query.code || "");
        const uid = String(request.query.state || "");
        const settingsUrl = `${appBaseUrl.value()}/settings`;

        if (!code || !uid) {
            response.redirect(`${settingsUrl}?gmail=error`);
            return;
        }

        try {
            const { tokens } = await gmailOAuthClient().getToken(code);

            if (!tokens.refresh_token) {
                // Google only returns a refresh_token on the first consent for a given
                // account/client. `prompt: "consent"` should force a fresh one each
                // time, but guard in case Google ever omits it anyway.
                logger.error(`Gmail OAuth: no refresh_token returned for uid ${uid}`);
                response.redirect(`${settingsUrl}?gmail=error`);
                return;
            }

            const db = getFirestore();
            const integrations = db.collection("users").doc(uid).collection("integrations");
            await integrations.doc("gmailSecret").set({ refreshToken: tokens.refresh_token }, { merge: true });
            await integrations.doc("gmailStatus").set(
                { connected: true, connectedAt: new Date().toISOString(), lastCheckedAt: null },
                { merge: true }
            );

            response.redirect(`${settingsUrl}?gmail=connected`);
        } catch (err) {
            logger.error(`Gmail OAuth callback failed for uid ${uid}:`, err);
            response.redirect(`${settingsUrl}?gmail=error`);
        }
    }
);

async function getGmailAccessToken(refreshToken: string): Promise<string> {
    const client = gmailOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    const { token } = await client.getAccessToken();
    if (!token) throw new Error("Failed to obtain Gmail access token");
    return token;
}

interface GmailMessageListResponse {
    messages?: { id: string; threadId: string }[];
}

async function countGmailMatches(accessToken: string, query: string): Promise<number> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${new URLSearchParams({
        q: query,
        maxResults: "10",
    })}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

    if (!res.ok) {
        const err = new Error(`Gmail API error ${res.status}`) as Error & { statusCode: number };
        err.statusCode = res.status;
        throw err;
    }

    const data = (await res.json()) as GmailMessageListResponse;
    return data.messages?.length ?? 0;
}

// Checks every connected user's Gmail for new retailer "review is live"
// emails since their last check, and pushes a notification if any are found.
async function runGmailReviewCheck(db: Firestore): Promise<{ checked: number; notified: number; reauthNeeded: number }> {
    let checked = 0;
    let notified = 0;
    let reauthNeeded = 0;

    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
        const integrations = db.collection("users").doc(userDoc.id).collection("integrations");
        const statusRef = integrations.doc("gmailStatus");
        const status = (await statusRef.get()).data();
        if (!status || status.connected !== true) continue;

        const refreshToken = (await integrations.doc("gmailSecret").get()).data()?.refreshToken;
        if (!refreshToken) continue;

        checked++;

        try {
            const accessToken = await getGmailAccessToken(refreshToken);
            const lastCheckedAt = status.lastCheckedAt ? new Date(status.lastCheckedAt) : new Date(0);
            const afterEpoch = Math.floor(lastCheckedAt.getTime() / 1000);

            let matches = 0;
            for (const pattern of Object.values(RETAILER_EMAIL_PATTERNS)) {
                matches += await countGmailMatches(accessToken, `${pattern} after:${afterEpoch}`);
            }

            if (matches > 0) {
                const wasSent = await sendPushToAllSubscriptions(db, userDoc.id, {
                    title: "📝 A review may be live",
                    body: `Found ${matches} new email${matches === 1 ? "" : "s"} that look like a review confirmation — check your inbox and update the tracker.`,
                    url: "/products",
                    tag: "gmail-review-live",
                });
                if (wasSent) notified++;
            }

            await statusRef.set({ lastCheckedAt: new Date().toISOString() }, { merge: true });
        } catch (err: any) {
            if (err?.statusCode === 401 || String(err?.message).includes("invalid_grant")) {
                reauthNeeded++;
                await statusRef.set({ connected: false }, { merge: true });
                await sendPushToAllSubscriptions(db, userDoc.id, {
                    title: "🔌 Reconnect Gmail",
                    body: "Your Gmail connection expired — reconnect it in Settings to keep getting review alerts.",
                    url: "/settings",
                    tag: "gmail-reconnect",
                });
                logger.warn(`Gmail token expired for user ${userDoc.id}, marked disconnected`);
            } else {
                logger.error(`Gmail check failed for user ${userDoc.id}:`, err);
            }
        }
    }

    return { checked, notified, reauthNeeded };
}

// Runs the Gmail review-live check hourly for every connected user.
export const checkGmailForReviewLive = onSchedule(
    {
        schedule: "0 * * * *", // every hour on the hour
        secrets: [gmailOAuthClientId, gmailOAuthClientSecret, gmailOAuthRedirectUri, vapidPublicKey, vapidPrivateKey, vapidSubject],
    },
    async () => {
        const db = getFirestore();
        configureWebPush();
        const result = await runGmailReviewCheck(db);
        logger.info(`Gmail review check: ${result.checked} users checked, ${result.notified} notified, ${result.reauthNeeded} need reauth`);
    }
);

// Manual trigger for testing — POST /triggerGmailCheck (remove before production)
export const triggerGmailCheck = onRequest(
    {
        secrets: [gmailOAuthClientId, gmailOAuthClientSecret, gmailOAuthRedirectUri, vapidPublicKey, vapidPrivateKey, vapidSubject],
    },
    async (request, response) => {
        if (request.method !== "POST") {
            response.status(405).json({ error: "Use POST" });
            return;
        }
        const db = getFirestore();
        configureWebPush();
        const result = await runGmailReviewCheck(db);
        response.status(200).json(result);
    }
);
