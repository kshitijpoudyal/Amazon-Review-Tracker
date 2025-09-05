import express from 'express';
import cors from 'cors';
import notificationService from './notificationScheduler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Notification service is running' });
});

app.post('/api/check-notifications', async (req, res) => {
  try {
    console.log('📧 Manual notification check triggered');
    await notificationService.checkAndNotifyAllUsers();
    res.json({ success: true, message: 'Notification check completed' });
  } catch (error) {
    console.error('❌ Error in manual notification check:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/check-user-notifications', async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either userId or email is required' 
      });
    }

    const user = { uid: userId, email };
    await notificationService.checkAndNotifyUser(user);
    
    res.json({ 
      success: true, 
      message: `Notification check completed for user: ${email || userId}` 
    });
  } catch (error) {
    console.error('❌ Error in user notification check:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notification API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 Manual trigger: POST http://localhost:${PORT}/api/check-notifications`);
});

export default app;
