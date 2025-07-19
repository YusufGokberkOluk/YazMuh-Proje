const Comment = require('../models/Comment');
const User = require('../models/User');
const Page = require('../models/Page');
const Notification = require('../models/Notification');
const { getCache, setCache, deleteCache, clearCacheByPattern } = require('../config/redis');

// Sayfadaki yorumları getir
const getComments = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { blockId } = req.query;
    const userId = req.user._id;

    // Cache'den kontrol et
    const cacheKey = `comments:${pageId}:${blockId || 'all'}:${userId}`;
    const cachedComments = await getCache(cacheKey);
    
    if (cachedComments) {
      return res.json({
        success: true,
        data: cachedComments,
        message: 'Yorumlar cache\'den getirildi'
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

    // Yorumları getir
    const query = { page: pageId };
    if (blockId) query.block = blockId;

    const comments = await Comment.find(query)
      .populate('author', 'username email avatar')
      .populate('mentions', 'username email avatar')
      .populate('resolvedBy', 'username email')
      .populate({
        path: 'parent',
        populate: {
          path: 'author',
          select: 'username email avatar'
        }
      })
      .sort({ createdAt: 1 });

    // Hiyerarşik yapı oluştur
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentMap[comment._id] = { ...comment.toObject(), replies: [] };
    });

    comments.forEach(comment => {
      if (comment.parent) {
        if (commentMap[comment.parent]) {
          commentMap[comment.parent].replies.push(commentMap[comment._id]);
        }
      } else {
        rootComments.push(commentMap[comment._id]);
      }
    });

    // Cache'e kaydet (15 dakika)
    await setCache(cacheKey, rootComments, 900);

    res.json({
      success: true,
      data: rootComments,
      message: 'Yorumlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Yorum getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Yorum oluştur
const createComment = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { content, blockId, parentId } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Yorum içeriği gereklidir'
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
        message: 'Bu sayfaya yorum yapma yetkiniz yok'
      });
    }

    // Mention'ları işle
    const mentionRegex = /@(\w+)/g;
    const mentionUsernames = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionUsernames.push(match[1]);
    }

    // Mention edilen kullanıcıları bul
    const mentionedUsers = await User.find({ username: { $in: mentionUsernames } });
    const mentionIds = mentionedUsers.map(user => user._id);

    const comment = await Comment.create({
      content,
      page: pageId,
      block: blockId || null,
      author: userId,
      parent: parentId || null,
      mentions: mentionIds
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username email avatar')
      .populate('mentions', 'username email avatar');

    // Mention edilen kullanıcılara bildirim gönder
    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser._id.toString() !== userId.toString()) {
        await Notification.create({
          recipient: mentionedUser._id,
          sender: userId,
          type: 'comment_mention',
          title: 'Yorumda bahsedildiniz',
          message: `${req.user.username} sizi bir yorumda bahsetti`,
          data: {
            pageId,
            commentId: comment._id,
            blockId
          }
        });
      }
    }

    // Parent yorum varsa, yazarına bildirim gönder
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment && parentComment.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          sender: userId,
          type: 'comment_reply',
          title: 'Yorumunuza yanıt',
          message: `${req.user.username} yorumunuza yanıt verdi`,
          data: {
            pageId,
            commentId: comment._id,
            parentCommentId: parentId
          }
        });
      }
    }

    // Cache'i temizle
    await clearCacheByPattern(`comments:${pageId}:*`);

    res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Yorum başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Yorum oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum oluşturulamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Yorum güncelle
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Yorum içeriği gereklidir'
      });
    }

    const comment = await Comment.findById(commentId).populate('page');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    // Yorum sahibi mi kontrol et
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu yorumu düzenleme yetkiniz yok'
      });
    }

    // Mention'ları işle
    const mentionRegex = /@(\w+)/g;
    const mentionUsernames = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionUsernames.push(match[1]);
    }

    const mentionedUsers = await User.find({ username: { $in: mentionUsernames } });
    const mentionIds = mentionedUsers.map(user => user._id);

    comment.content = content;
    comment.mentions = mentionIds;
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'username email avatar')
      .populate('mentions', 'username email avatar');

    // Cache'i temizle
    await clearCacheByPattern(`comments:${comment.page}:*`);

    res.json({
      success: true,
      data: updatedComment,
      message: 'Yorum başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Yorum sil
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId).populate('page');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    // Yorum sahibi veya sayfa sahibi mi kontrol et
    const isOwner = comment.author.toString() === userId.toString();
    const isPageOwner = comment.page.owner.toString() === userId.toString();

    if (!isOwner && !isPageOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bu yorumu silme yetkiniz yok'
      });
    }

    await Comment.findByIdAndDelete(commentId);

    // Cache'i temizle
    await clearCacheByPattern(`comments:${comment.page}:*`);

    res.json({
      success: true,
      message: 'Yorum başarıyla silindi'
    });
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum silinemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Yorumu çözüldü olarak işaretle
const resolveComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId).populate('page');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    // Sayfa sahibi veya yorum sahibi mi kontrol et
    const isPageOwner = comment.page.owner.toString() === userId.toString();
    const isCommentOwner = comment.author.toString() === userId.toString();

    if (!isPageOwner && !isCommentOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bu yorumu çözme yetkiniz yok'
      });
    }

    comment.isResolved = !comment.isResolved;
    if (comment.isResolved) {
      comment.resolvedBy = userId;
      comment.resolvedAt = new Date();
    } else {
      comment.resolvedBy = null;
      comment.resolvedAt = null;
    }

    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'username email avatar')
      .populate('resolvedBy', 'username email');

    // Cache'i temizle
    await clearCacheByPattern(`comments:${comment.page}:*`);

    res.json({
      success: true,
      data: updatedComment,
      message: `Yorum ${comment.isResolved ? 'çözüldü' : 'çözülmedi'} olarak işaretlendi`
    });
  } catch (error) {
    console.error('Yorum çözme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum durumu güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  resolveComment
}; 