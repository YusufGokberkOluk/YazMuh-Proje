const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
  updateNotificationSettings
} = require('../controllers/notificationController');

// Bildirim route'ları
router.get('/notifications', protect, getNotifications);
router.put('/notifications/mark-read', protect, markAsRead);
router.delete('/notifications/:notificationId', protect, deleteNotification);
router.get('/notifications/unread-count', protect, getUnreadCount);
router.put('/notifications/settings', protect, updateNotificationSettings);

module.exports = router; 