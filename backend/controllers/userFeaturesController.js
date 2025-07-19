const User = require('../models/User');
const Page = require('../models/Page');

// Favori sayfa ekle/çıkar
const toggleFavorite = async (req, res) => {
  try {
    const { pageId } = req.body;
    const userId = req.user._id;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        message: 'Sayfa ID gereklidir'
      });
    }

    // Sayfanın var olduğunu kontrol et
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    const user = await User.findById(userId);
    const isFavorite = user.favoritePages.includes(pageId);

    if (isFavorite) {
      // Favorilerden çıkar
      await User.findByIdAndUpdate(userId, {
        $pull: { favoritePages: pageId }
      });
      
      res.json({
        success: true,
        data: { isFavorite: false },
        message: 'Sayfa favorilerden çıkarıldı'
      });
    } else {
      // Favorilere ekle
      await User.findByIdAndUpdate(userId, {
        $push: { favoritePages: pageId }
      });
      
      res.json({
        success: true,
        data: { isFavorite: true },
        message: 'Sayfa favorilere eklendi'
      });
    }
  } catch (error) {
    console.error('Favori işlemi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Favori işlemi başarısız',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcının favori sayfalarını listele
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: 'favoritePages',
        populate: [
          { path: 'owner', select: 'username email' },
          { path: 'workspace', select: 'name' }
        ]
      });

    res.json({
      success: true,
      data: user.favoritePages,
      message: 'Favori sayfalar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Favori sayfalar getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Favori sayfalar getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sayfaya etiket ekle
const addTag = async (req, res) => {
  try {
    const { pageId, tag } = req.body;
    const userId = req.user._id;

    if (!pageId || !tag) {
      return res.status(400).json({
        success: false,
        message: 'Sayfa ID ve etiket gereklidir'
      });
    }

    const page = await Page.findById(pageId);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi veya davetli editor etiket ekleyebilir
    const canEdit = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => 
        invite.user.toString() === userId.toString() && invite.role === 'editor'
      );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfaya etiket ekleme yetkiniz yok'
      });
    }

    const trimmedTag = tag.trim().toLowerCase();
    
    // Etiket zaten var mı kontrol et
    if (page.tags.includes(trimmedTag)) {
      return res.status(400).json({
        success: false,
        message: 'Bu etiket zaten mevcut'
      });
    }

    // Etiketi ekle
    page.tags.push(trimmedTag);
    await page.save();

    res.json({
      success: true,
      data: page.tags,
      message: 'Etiket başarıyla eklendi'
    });
  } catch (error) {
    console.error('Etiket ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Etiket eklenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sayfadan etiket kaldır
const removeTag = async (req, res) => {
  try {
    const { pageId, tag } = req.body;
    const userId = req.user._id;

    if (!pageId || !tag) {
      return res.status(400).json({
        success: false,
        message: 'Sayfa ID ve etiket gereklidir'
      });
    }

    const page = await Page.findById(pageId);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi veya davetli editor etiket kaldırabilir
    const canEdit = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => 
        invite.user.toString() === userId.toString() && invite.role === 'editor'
      );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfadan etiket kaldırma yetkiniz yok'
      });
    }

    const trimmedTag = tag.trim().toLowerCase();
    
    // Etiket var mı kontrol et
    if (!page.tags.includes(trimmedTag)) {
      return res.status(400).json({
        success: false,
        message: 'Bu etiket mevcut değil'
      });
    }

    // Etiketi kaldır
    page.tags = page.tags.filter(t => t !== trimmedTag);
    await page.save();

    res.json({
      success: true,
      data: page.tags,
      message: 'Etiket başarıyla kaldırıldı'
    });
  } catch (error) {
    console.error('Etiket kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Etiket kaldırılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  addTag,
  removeTag
}; 