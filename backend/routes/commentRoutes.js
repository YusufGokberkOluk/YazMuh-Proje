const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  resolveComment
} = require('../controllers/commentController');

// Yorum route'ları
router.get('/pages/:pageId/comments', protect, getComments);
router.post('/pages/:pageId/comments', protect, createComment);
router.put('/comments/:commentId', protect, updateComment);
router.delete('/comments/:commentId', protect, deleteComment);
router.put('/comments/:commentId/resolve', protect, resolveComment);

module.exports = router; 