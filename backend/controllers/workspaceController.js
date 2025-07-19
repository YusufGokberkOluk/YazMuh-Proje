const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Yeni workspace oluştur
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Workspace adı gereklidir'
      });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      owner: userId
    });

    // Kullanıcının workspaces listesine ekle
    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id }
    });

    // Populate ile workspace'i getir
    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    res.status(201).json({
      success: true,
      data: populatedWorkspace,
      message: 'Workspace başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Workspace oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Workspace oluşturulamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcının tüm workspace'lerini listele
const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user._id;

    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
    .populate('owner', 'username email')
    .populate('members.user', 'username email')
    .populate('pages', 'title tags')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: workspaces,
      message: 'Workspace\'ler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Workspace listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Workspace\'ler getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Belirli bir workspace'in detaylarını getir
const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email')
      .populate({
        path: 'pages',
        populate: {
          path: 'owner',
          select: 'username email'
        }
      });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace bulunamadı'
      });
    }

    // Kullanıcının bu workspace'e erişim yetkisi var mı kontrol et
    const hasAccess = workspace.owner.toString() === userId.toString() ||
      workspace.members.some(member => member.user._id.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bu workspace\'e erişim yetkiniz yok'
      });
    }

    res.json({
      success: true,
      data: workspace,
      message: 'Workspace detayları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Workspace getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Workspace getirilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Workspace ismini güncelle
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Workspace adı gereklidir'
      });
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace bulunamadı'
      });
    }

    // Sadece workspace sahibi güncelleyebilir
    if (workspace.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için workspace sahibi olmanız gereklidir'
      });
    }

    workspace.name = name.trim();
    await workspace.save();

    const updatedWorkspace = await Workspace.findById(id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    res.json({
      success: true,
      data: updatedWorkspace,
      message: 'Workspace başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Workspace güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Workspace güncellenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Workspace'i sil
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace bulunamadı'
      });
    }

    // Sadece workspace sahibi silebilir
    if (workspace.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için workspace sahibi olmanız gereklidir'
      });
    }

    // Workspace'deki tüm sayfaları sil
    const Page = require('../models/Page');
    await Page.deleteMany({ workspace: id });

    // Workspace'i sil
    await Workspace.findByIdAndDelete(id);

    // Kullanıcının workspaces listesinden çıkar
    await User.findByIdAndUpdate(userId, {
      $pull: { workspaces: id }
    });

    res.json({
      success: true,
      message: 'Workspace ve ilişkili tüm sayfalar başarıyla silindi'
    });
  } catch (error) {
    console.error('Workspace silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Workspace silinemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace
}; 