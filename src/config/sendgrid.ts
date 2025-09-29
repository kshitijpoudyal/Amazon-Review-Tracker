// SendGrid configuration for email services
// Note: For security, SendGrid should be used server-side only in production

// Environment variables access helper
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // In production, these should come from your server/API
    return defaultValue;
  }
  return process.env[key] || defaultValue;
};

export const sendGridConfig = {
  // For development/demo - in production, move to server-side
  apiKey: getEnvVar('VITE_SENDGRID_API_KEY', ''),
  fromEmail: getEnvVar('VITE_FROM_EMAIL', 'noreply@amazonreviewtracker.com'),
  fromName: getEnvVar('VITE_FROM_NAME', 'Amazon Review Tracker'),
  
  // Email templates
  templates: {
    returnWindowReminder: {
      subject: 'Return Window Alert - Action Required',
      templateId: 'return-window-reminder', // You can create this in SendGrid
    }
  },
  
  // Validation
  isConfigured: () => {
    const apiKey = getEnvVar('VITE_SENDGRID_API_KEY');
    const fromEmail = getEnvVar('VITE_FROM_EMAIL');
    
    if (!apiKey || apiKey === 'your_sendgrid_api_key_here') {
      console.warn('⚠️ SendGrid API key not configured');
      return false;
    }
    
    if (!fromEmail || fromEmail === 'your-verified-sender@yourdomain.com') {
      console.warn('⚠️ SendGrid sender email not configured');
      return false;
    }
    
    return true;
  }
} as const;

export default sendGridConfig;