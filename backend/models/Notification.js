const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'page_invite', 'comment_mention', 'comment_reply',
      'page_shared', 'workspace_invite', 'block_updated',
      'mention', 'like', 'follow'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Bildirim sıralaması için index
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 gün sonra sil

// Okunmamış bildirim sayısını hesapla
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

// Bildirimleri toplu olarak okundu olarak işaretle
notificationSchema.statics.markAsRead = async function(userId, notificationIds = null) {
  const query = { recipient: userId, isRead: false };
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return await this.updateMany(query, { 
    isRead: true, 
    readAt: new Date() 
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 