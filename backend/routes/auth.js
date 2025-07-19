const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register - Kullanıcı kaydı
router.post('/register', register);

// POST /api/auth/login - Kullanıcı girişi
router.post('/login', login);

// POST /api/auth/logout - Kullanıcı çıkışı (korumalı route)
router.post('/logout', protect, logout);

// GET /api/auth/profile - Kullanıcı profili (korumalı route)
router.get('/profile', protect, getProfile);

// DELETE /api/auth/account - Hesap silme (korumalı route)
router.delete('/account', protect, deleteAccount);

module.exports = router; 