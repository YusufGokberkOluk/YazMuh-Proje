const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  completeText,
  checkGrammar,
  translate,
  suggestTitle,
  ocr,
  calendarSync
} = require('../controllers/aiController');

// Tüm AI rotaları JWT middleware ile korunur
router.use(protect);

// POST /api/ai/complete-text - Metin tamamlama
router.post('/complete-text', completeText);

// POST /api/ai/check-grammar - Dilbilgisi kontrolü
router.post('/check-grammar', checkGrammar);

// POST /api/ai/translate - Çeviri
router.post('/translate', translate);

// POST /api/ai/suggest-title - Başlık önerisi
router.post('/suggest-title', suggestTitle);

// POST /api/ai/ocr - OCR (görselden metin okuma)
router.post('/ocr', ocr);

// POST /api/ai/calendar-sync - Takvim senkronizasyonu
router.post('/calendar-sync', calendarSync);

module.exports = router; 