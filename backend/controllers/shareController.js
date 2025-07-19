const Page = require('../models/Page');
const User = require('../models/User');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../config/rabbitmq');

// Sayfaya kullanıcı davet et
const inviteUser = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { email, role } = req.body;
    const userId = req.user._id;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email ve rol gereklidir'
      });
    }

    if (!['viewer', 'editor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol "viewer" veya "editor" olmalıdır'
      });
    }

    const page = await Page.findById(pageId)
      .populate('owner', 'username email');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi davet edebilir
    if (page.owner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için sayfa sahibi olmanız gereklidir'
      });
    }

    // Davet edilecek kullanıcıyı bul
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // Kendini davet etmeye çalışıyor mu kontrol et
    if (invitedUser._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi davet edemezsiniz'
      });
    }

    // Kullanıcı zaten davetli mi kontrol et
    const alreadyInvited = page.permissions.invitedUsers.some(
      invite => invite.user.toString() === invitedUser._id.toString()
    );

    if (alreadyInvited) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı zaten davetli'
      });
    }

    // Kullanıcıyı davet et
    page.permissions.invitedUsers.push({
      user: invitedUser._id,
      role: role
    });

    await page.save();

    const populatedPage = await Page.findById(pageId)
      .populate('permissions.invitedUsers.user', 'username email');

    // RabbitMQ'ya davet e-postası mesajı gönder
    try {
      const invitationData = {
        invitedUserEmail: invitedUser.email,
        invitedUserName: invitedUser.username,
        inviterName: page.owner.username,
        pageTitle: page.title,
        pageId: page._id.toString(),
        role: role,
        shareLink: page.permissions.shareLink
      };

      await sendInvitationEmail(invitationData);
      console.log('Davet e-postası kuyruğa gönderildi');
    } catch (error) {
      console.error('RabbitMQ mesaj gönderme hatası:', error);
      // E-posta gönderilemese bile davet işlemi başarılı sayılır
    }

    res.json({
      success: true,
      data: populatedPage.permissions.invitedUsers,
      message: 'Kullanıcı başarıyla davet edildi'
    });
  } catch (error) {
    console.error('Kullanıcı davet hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı davet edilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sayfa paylaşım ayarlarını güncelle
const updatePermissions = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { publicAccess } = req.body;
    const userId = req.user._id;

    if (!publicAccess || !['none', 'read-only'].includes(publicAccess)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir publicAccess değeri gereklidir ("none" veya "read-only")'
      });
    }

    const page = await Page.findById(pageId);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi ayarları değiştirebilir
    if (page.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için sayfa sahibi olmanız gereklidir'
      });
    }

    page.permissions.publicAccess = publicAccess;

    // Eğer publicAccess "none" ise share link'i temizle
    if (publicAccess === 'none') {
      page.permissions.shareLink = null;
    } else if (publicAccess === 'read-only' && !page.permissions.shareLink) {
      // Eğer "read-only" ise ve share link yoksa oluştur
      page.permissions.shareLink = crypto.randomBytes(16).toString('hex');
    }

    await page.save();

    res.json({
      success: true,
      data: {
        publicAccess: page.permissions.publicAccess,
        shareLink: page.permissions.shareLink
      },
      message: 'Paylaşım ayarları başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Paylaşım ayarları güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Paylaşım ayarları güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Paylaşım linki ile halka açık sayfa getir
const getPublicPage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { shareLink } = req.query;

    const page = await Page.findById(pageId)
      .populate('owner', 'username')
      .populate('workspace', 'name');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Paylaşım linki kontrolü
    if (page.permissions.publicAccess === 'none') {
      return res.status(403).json({
        success: false,
        message: 'Bu sayfa paylaşıma kapalı'
      });
    }

    if (page.permissions.publicAccess === 'read-only') {
      if (!shareLink || shareLink !== page.permissions.shareLink) {
        return res.status(403).json({
          success: false,
          message: 'Geçersiz paylaşım linki'
        });
      }
    }

    // Sadece okuma için gerekli bilgileri döndür
    const publicPageData = {
      _id: page._id,
      title: page.title,
      content: page.content,
      tags: page.tags,
      owner: page.owner,
      workspace: page.workspace,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt
    };

    res.json({
      success: true,
      data: publicPageData,
      message: 'Sayfa başarıyla getirildi'
    });
  } catch (error) {
    console.error('Halka açık sayfa getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sayfa getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Davetli kullanıcıyı kaldır
const removeInvitedUser = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { userId: invitedUserId } = req.body;
    const currentUserId = req.user._id;

    if (!invitedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Davet edilecek kullanıcı ID\'si gereklidir'
      });
    }

    const page = await Page.findById(pageId);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    // Sadece sayfa sahibi davetli kullanıcıları kaldırabilir
    if (page.owner.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için sayfa sahibi olmanız gereklidir'
      });
    }

    // Kullanıcıyı davetli listesinden çıkar
    page.permissions.invitedUsers = page.permissions.invitedUsers.filter(
      invite => invite.user.toString() !== invitedUserId
    );

    await page.save();

    const populatedPage = await Page.findById(pageId)
      .populate('permissions.invitedUsers.user', 'username email');

    res.json({
      success: true,
      data: populatedPage.permissions.invitedUsers,
      message: 'Kullanıcı davet listesinden kaldırıldı'
    });
  } catch (error) {
    console.error('Davetli kullanıcı kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı kaldırılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  inviteUser,
  updatePermissions,
  getPublicPage,
  removeInvitedUser
}; 