const Page = require('../models/Page');
const Workspace = require('../models/Workspace');
const path = require('path');
const fs = require('fs');
const { getCache, setCache, deleteCache, clearCacheByPattern } = require('../config/redis');

// Yeni sayfa oluştur
const createPage = async (req, res) => {
  try {
    const { title, content, workspaceId, tags } = req.body;
    const userId = req.user._id;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID gereklidir'
      });
    }

    // Workspace'in var olduğunu ve kullanıcının erişim yetkisi olduğunu kontrol et
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace bulunamadı'
      });
    }

    const hasAccess = workspace.owner.toString() === userId.toString() ||
      workspace.members.some(member => member.user.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bu workspace\'e erişim yetkiniz yok'
      });
    }

    const page = await Page.create({
      title: title || 'Untitled',
      content: content || '',
      tags: tags || [],
      owner: userId,
      workspace: workspaceId
    });

    // Workspace'in pages listesine ekle
    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { pages: page._id }
    });

    const populatedPage = await Page.findById(page._id)
      .populate('owner', 'username email')
      .populate('workspace', 'name');

    // Workspace cache'ini temizle
    await clearCacheByPattern(`workspace:${workspaceId}:*`);

    res.status(201).json({
      success: true,
      data: populatedPage,
      message: 'Sayfa başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Sayfa oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sayfa oluşturulamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Belirli bir sayfanın içeriğini getir (cache ile)
const getPageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Cache'den kontrol et
    const cacheKey = `page:${id}:${userId}`;
    const cachedPage = await getCache(cacheKey);
    
    if (cachedPage) {
      return res.json({
        success: true,
        data: cachedPage,
        message: 'Sayfa cache\'den getirildi'
      });
    }

    const page = await Page.findById(id)
      .populate('owner', 'username email')
      .populate('workspace', 'name')
      .populate('permissions.invitedUsers.user', 'username email');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Kullanıcının bu sayfaya erişim yetkisi var mı kontrol et
    const hasAccess = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => invite.user._id.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfaya erişim yetkiniz yok'
      });
    }

    // Cache'e kaydet (1 saat)
    await setCache(cacheKey, page, 3600);

    res.json({
      success: true,
      data: page,
      message: 'Sayfa başarıyla getirildi'
    });
  } catch (error) {
    console.error('Sayfa getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sayfa getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sayfa güncelle (auto-save için)
const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user._id;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi veya davetli editor güncelleyebilir
    const canEdit = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => 
        invite.user.toString() === userId.toString() && invite.role === 'editor'
      );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfayı düzenleme yetkiniz yok'
      });
    }

    // Sadece değişen alanları güncelle
    if (title !== undefined) page.title = title;
    if (content !== undefined) page.content = content;
    if (tags !== undefined) page.tags = tags;

    await page.save();

    const updatedPage = await Page.findById(id)
      .populate('owner', 'username email')
      .populate('workspace', 'name');

    // İlgili cache'leri temizle
    await clearCacheByPattern(`page:${id}:*`);
    await clearCacheByPattern(`workspace:${page.workspace}:*`);

    res.json({
      success: true,
      data: updatedPage,
      message: 'Sayfa başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Sayfa güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sayfa güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sayfa sil
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi silebilir
    if (page.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfayı silme yetkiniz yok'
      });
    }

    // Workspace'in pages listesinden çıkar
    await Workspace.findByIdAndUpdate(page.workspace, {
      $pull: { pages: id }
    });

    // Kullanıcıların favoritePages listesinden çıkar
    const User = require('../models/User');
    await User.updateMany(
      { favoritePages: id },
      { $pull: { favoritePages: id } }
    );

    // Sayfayı sil
    await Page.findByIdAndDelete(id);

    // İlgili cache'leri temizle
    await clearCacheByPattern(`page:${id}:*`);
    await clearCacheByPattern(`workspace:${page.workspace}:*`);

    res.json({
      success: true,
      message: 'Sayfa başarıyla silindi'
    });
  } catch (error) {
    console.error('Sayfa silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sayfa silinemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Görsel yükleme
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Görsel dosyası gereklidir'
      });
    }

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Dosyayı sil
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Sadece JPEG, PNG, GIF ve WebP formatları desteklenir'
      });
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu 5MB\'dan küçük olmalıdır'
      });
    }

    // URL oluştur
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Görsel başarıyla yüklendi'
    });
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Görsel yüklenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createPage,
  getPageById,
  updatePage,
  deletePage,
  uploadImage
}; 