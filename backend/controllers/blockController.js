const Block = require('../models/Block');
const Page = require('../models/Page');
const { getCache, setCache, deleteCache, clearCacheByPattern } = require('../config/redis');

// Sayfadaki blokları getir
const getBlocks = async (req, res) => {
  try {
    const { pageId } = req.params;
    const userId = req.user._id;

    // Cache'den kontrol et
    const cacheKey = `blocks:${pageId}:${userId}`;
    const cachedBlocks = await getCache(cacheKey);
    
    if (cachedBlocks) {
      return res.json({
        success: true,
        data: cachedBlocks,
        message: 'Bloklar cache\'den getirildi'
      });
    }

    // Sayfanın var olduğunu ve erişim yetkisi olduğunu kontrol et
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    const hasAccess = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => invite.user.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfaya erişim yetkiniz yok'
      });
    }

    // Blokları hiyerarşik olarak getir
    const blocks = await Block.find({ page: pageId })
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email')
      .sort({ order: 1 });

    // Hiyerarşik yapı oluştur
    const blockMap = {};
    const rootBlocks = [];

    blocks.forEach(block => {
      blockMap[block._id] = { ...block.toObject(), children: [] };
    });

    blocks.forEach(block => {
      if (block.parent) {
        if (blockMap[block.parent]) {
          blockMap[block.parent].children.push(blockMap[block._id]);
        }
      } else {
        rootBlocks.push(blockMap[block._id]);
      }
    });

    // Cache'e kaydet (30 dakika)
    await setCache(cacheKey, rootBlocks, 1800);

    res.json({
      success: true,
      data: rootBlocks,
      message: 'Bloklar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Blok getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bloklar getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Yeni blok oluştur
const createBlock = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { type, content, parent, order } = req.body;
    const userId = req.user._id;

    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: 'Blok türü ve içerik gereklidir'
      });
    }

    // Sayfanın var olduğunu ve düzenleme yetkisi olduğunu kontrol et
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

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

    // Sıra numarasını belirle
    let blockOrder = order;
    if (!blockOrder) {
      const lastBlock = await Block.findOne({ page: pageId, parent: parent || null })
        .sort({ order: -1 });
      blockOrder = lastBlock ? lastBlock.order + 1 : 0;
    }

    const block = await Block.create({
      type,
      content,
      page: pageId,
      parent: parent || null,
      order: blockOrder,
      createdBy: userId,
      lastModifiedBy: userId
    });

    const populatedBlock = await Block.findById(block._id)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email');

    // Cache'i temizle
    await clearCacheByPattern(`blocks:${pageId}:*`);

    res.status(201).json({
      success: true,
      data: populatedBlock,
      message: 'Blok başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Blok oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Blok oluşturulamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Blok güncelle
const updateBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { content, type, order } = req.body;
    const userId = req.user._id;

    const block = await Block.findById(blockId).populate('page');
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Blok bulunamadı'
      });
    }

    // Sayfa düzenleme yetkisi kontrolü
    const page = await Page.findById(block.page);
    const canEdit = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => 
        invite.user.toString() === userId.toString() && invite.role === 'editor'
      );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bu bloğu düzenleme yetkiniz yok'
      });
    }

    // Güncelle
    if (content !== undefined) block.content = content;
    if (type !== undefined) block.type = type;
    if (order !== undefined) block.order = order;
    block.lastModifiedBy = userId;

    await block.save();

    const updatedBlock = await Block.findById(blockId)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email');

    // Cache'i temizle
    await clearCacheByPattern(`blocks:${block.page}:*`);

    res.json({
      success: true,
      data: updatedBlock,
      message: 'Blok başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Blok güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Blok güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Blok sil
const deleteBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const userId = req.user._id;

    const block = await Block.findById(blockId).populate('page');
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Blok bulunamadı'
      });
    }

    // Sayfa düzenleme yetkisi kontrolü
    const page = await Page.findById(block.page);
    const canEdit = page.owner.toString() === userId.toString() ||
      page.permissions.invitedUsers.some(invite => 
        invite.user.toString() === userId.toString() && invite.role === 'editor'
      );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bu bloğu silme yetkiniz yok'
      });
    }

    await Block.findByIdAndDelete(blockId);

    // Cache'i temizle
    await clearCacheByPattern(`blocks:${block.page}:*`);

    res.json({
      success: true,
      message: 'Blok başarıyla silindi'
    });
  } catch (error) {
    console.error('Blok silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Blok silinemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Blokları yeniden sırala
const reorderBlocks = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { blocks } = req.body; // [{ id, order, parent }]
    const userId = req.user._id;

    if (!Array.isArray(blocks)) {
      return res.status(400).json({
        success: false,
        message: 'Blok listesi gereklidir'
      });
    }

    // Sayfa düzenleme yetkisi kontrolü
    const page = await Page.findById(pageId);
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

    // Blokları toplu güncelle
    const updatePromises = blocks.map(blockData => 
      Block.findByIdAndUpdate(blockData.id, {
        order: blockData.order,
        parent: blockData.parent || null,
        lastModifiedBy: userId
      })
    );

    await Promise.all(updatePromises);

    // Cache'i temizle
    await clearCacheByPattern(`blocks:${pageId}:*`);

    res.json({
      success: true,
      message: 'Bloklar başarıyla yeniden sıralandı'
    });
  } catch (error) {
    console.error('Blok sıralama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bloklar yeniden sıralanamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks
}; 