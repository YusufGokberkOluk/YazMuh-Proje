const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace
} = require('../controllers/workspaceController');

// Tüm workspace rotaları JWT middleware ile korunur
router.use(protect);

// POST /api/workspaces - Yeni workspace oluştur
router.post('/', createWorkspace);

// GET /api/workspaces - Kullanıcının tüm workspace'lerini listele
router.get('/', getWorkspaces);

// GET /api/workspaces/:id - Belirli bir workspace'in detaylarını getir
router.get('/:id', getWorkspaceById);

// PUT /api/workspaces/:id - Workspace ismini güncelle
router.put('/:id', updateWorkspace);

// DELETE /api/workspaces/:id - Workspace'i sil
router.delete('/:id', deleteWorkspace);

module.exports = router; 