const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  inviteUser,
  updatePermissions,
  getPublicPage,
  removeInvitedUser
} = require('../controllers/shareController');

// POST /api/share/invite/:pageId - Sayfaya kullanıcı davet et (korumalı)
router.post('/invite/:pageId', protect, inviteUser);

// PUT /api/share/permissions/:pageId - Paylaşım ayarlarını güncelle (korumalı)
router.put('/permissions/:pageId', protect, updatePermissions);

// GET /api/share/public/:pageId - Halka açık sayfa getir (korumasız)
router.get('/public/:pageId', getPublicPage);

// DELETE /api/share/remove-user/:pageId - Davetli kullanıcıyı kaldır (korumalı)
router.delete('/remove-user/:pageId', protect, removeInvitedUser);

module.exports = router; 