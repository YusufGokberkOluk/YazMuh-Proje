const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  createPage,
  getPageById,
  updatePage,
  deletePage,
  uploadImage
} = require('../controllers/pageController');

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Uploads klasörü yoksa oluştur
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Tüm page rotaları JWT middleware ile korunur
router.use(protect);

// POST /api/pages - Yeni sayfa oluştur
router.post('/', createPage);

// GET /api/pages/:id - Belirli bir sayfanın içeriğini getir
router.get('/:id', getPageById);

// PUT /api/pages/:id - Sayfa güncelle (auto-save için)
router.put('/:id', updatePage);

// DELETE /api/pages/:id - Sayfa sil
router.delete('/:id', deletePage);

// POST /api/pages/upload-image - Görsel yükle
router.post('/upload-image', upload.single('image'), uploadImage);

module.exports = router; 