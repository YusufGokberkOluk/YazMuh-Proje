const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchContent,
  advancedSearch,
  getSearchSuggestions
} = require('../controllers/searchController');

// Arama route'ları
router.get('/search', protect, searchContent);
router.get('/search/advanced', protect, advancedSearch);
router.get('/search/suggestions', protect, getSearchSuggestions);

module.exports = router; 