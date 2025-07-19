const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks
} = require('../controllers/blockController');

// Blok route'ları
router.get('/pages/:pageId/blocks', protect, getBlocks);
router.post('/pages/:pageId/blocks', protect, createBlock);
router.put('/blocks/:blockId', protect, updateBlock);
router.delete('/blocks/:blockId', protect, deleteBlock);
router.put('/pages/:pageId/blocks/reorder', protect, reorderBlocks);

module.exports = router; 