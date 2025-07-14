const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Admin-only notification management routes
router.post('/welcome', authenticate, authorizeAdmin, notificationController.sendWelcomeEmail);
router.post('/password-reset', authenticate, authorizeAdmin, notificationController.sendPasswordResetEmail);

// Test routes (for development)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test/welcome', notificationController.testWelcomeEmail);
}

// Get email configuration status
router.get('/settings', authenticate, authorizeAdmin, notificationController.getEmailSettings);

module.exports = router;