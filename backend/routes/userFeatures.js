const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  toggleFavorite,
  getFavorites,
  addTag,
  removeTag
} = require('../controllers/userFeaturesController');

// Tüm user features rotaları JWT middleware ile korunur
router.use(protect);

// POST /api/user/favorites - Favori sayfa ekle/çıkar
router.post('/favorites', toggleFavorite);

// GET /api/user/favorites - Kullanıcının favori sayfalarını listele
router.get('/favorites', getFavorites);

// POST /api/tags - Sayfaya etiket ekle
router.post('/tags', addTag);

// DELETE /api/tags - Sayfadan etiket kaldır
router.delete('/tags', removeTag);

module.exports = router; 