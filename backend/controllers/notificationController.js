const Notification = require('../models/Notification');
const { getCache, setCache, deleteCache } = require('../config/redis');

// Kullanıcının bildirimlerini getir
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Cache'den kontrol et
    const cacheKey = `notifications:${userId}:${page}:${limit}:${unreadOnly}`;
    const cachedNotifications = await getCache(cacheKey);
    
    if (cachedNotifications) {
      return res.json({
        success: true,
        data: cachedNotifications,
        message: 'Bildirimler cache\'den getirildi'
      });
    }

    const skip = (page - 1) * limit;
    const query = { recipient: userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    const result = {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      unreadCount
    };

    // Cache'e kaydet (5 dakika)
    await setCache(cacheKey, result, 300);

    res.json({
      success: true,
      data: result,
      message: 'Bildirimler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bildirimi okundu olarak işaretle
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    let result;
    if (notificationIds && Array.isArray(notificationIds)) {
      // Belirli bildirimleri okundu olarak işaretle
      result = await Notification.markAsRead(userId, notificationIds);
    } else {
      // Tüm bildirimleri okundu olarak işaretle
      result = await Notification.markAsRead(userId);
    }

    // Cache'i temizle
    await deleteCache(`notifications:${userId}:*`);

    res.json({
      success: true,
      data: result,
      message: 'Bildirimler okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Bildirim işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler işaretlenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bildirimi sil
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    // Bildirim sahibi mi kontrol et
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu bildirimi silme yetkiniz yok'
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    // Cache'i temizle
    await deleteCache(`notifications:${userId}:*`);

    res.json({
      success: true,
      message: 'Bildirim başarıyla silindi'
    });
  } catch (error) {
    console.error('Bildirim silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim silinemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Okunmamış bildirim sayısını getir
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Cache'den kontrol et
    const cacheKey = `unread_count:${userId}`;
    const cachedCount = await getCache(cacheKey);
    
    if (cachedCount !== null) {
      return res.json({
        success: true,
        data: { unreadCount: cachedCount },
        message: 'Okunmamış bildirim sayısı cache\'den getirildi'
      });
    }

    const unreadCount = await Notification.getUnreadCount(userId);

    // Cache'e kaydet (2 dakika)
    await setCache(cacheKey, unreadCount, 120);

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Okunmamış bildirim sayısı getirildi'
    });
  } catch (error) {
    console.error('Okunmamış bildirim sayısı hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış bildirim sayısı getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bildirim ayarlarını güncelle
const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { settings } = req.body;

    // Kullanıcı modelini güncelle (User modelinde notificationSettings alanı olmalı)
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings: settings },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: user.notificationSettings,
      message: 'Bildirim ayarları güncellendi'
    });
  } catch (error) {
    console.error('Bildirim ayarları güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim ayarları güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Bildirim gönder (iç kullanım için)
const sendNotification = async (recipientId, senderId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      data
    });

    // Cache'i temizle
    await deleteCache(`notifications:${recipientId}:*`);
    await deleteCache(`unread_count:${recipientId}`);

    return notification;
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    throw error;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
  updateNotificationSettings,
  sendNotification
}; 