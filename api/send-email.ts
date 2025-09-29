import sgMail from '@sendgrid/mail';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailRequest {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, html }: EmailRequest = req.body;

  // Validate request
  if (!to || !subject || !text) {
    return res.status(400).json({ 
      error: 'Missing required fields: to, subject, text' 
    });
  }

  // Validate environment
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not configured');
    return res.status(500).json({ 
      error: 'Email service not configured' 
    });
  }

  if (!process.env.FROM_EMAIL) {
    console.error('❌ FROM_EMAIL not configured');
    return res.status(500).json({ 
      error: 'Sender email not configured' 
    });
  }

  try {
    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME || 'Amazon Review Tracker'
      },
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`
    };

    console.log('📧 Sending email via SendGrid...');
    await sgMail.send(msg);
    console.log('✅ Email sent successfully');

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error: any) {
    console.error('❌ SendGrid error:', error);
    
    // Handle SendGrid specific errors
    if (error.response) {
      const { message, code, response } = error;
      console.error('SendGrid API Error:', {
        message,
        code,
        statusCode: response?.statusCode,
        body: response?.body
      });
    }

    res.status(500).json({ 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}