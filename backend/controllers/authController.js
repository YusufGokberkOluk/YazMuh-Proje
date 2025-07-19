const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Page = require('../models/Page');
const { addToBlocklist } = require('../config/redis');

// JWT token oluşturma fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Kullanıcı kaydı
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kullanıcının var olup olmadığını kontrol et
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor' 
      });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          workspaces: user.workspaces,
          favoritePages: user.favoritePages,
          preferences: user.preferences,
          token: generateToken(user._id),
        },
        message: 'Kullanıcı başarıyla oluşturuldu'
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Geçersiz kullanıcı verisi' 
      });
    }
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email }).populate('workspaces favoritePages');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Geçersiz email veya şifre' 
      });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Geçersiz email veya şifre' 
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        workspaces: user.workspaces,
        favoritePages: user.favoritePages,
        preferences: user.preferences,
        token: generateToken(user._id),
      },
      message: 'Giriş başarılı'
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcı çıkışı
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Token'ı Redis blocklist'e ekle
      await addToBlocklist(token);
    }

    res.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı'
    });
  } catch (error) {
    console.error('Çıkış hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çıkış işlemi başarısız',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcı profili getir
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('workspaces favoritePages');
    
    res.json({
      success: true,
      data: user,
      message: 'Profil bilgileri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Hesap silme
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kullanıcının sahip olduğu workspace'leri bul
    const userWorkspaces = await Workspace.find({ owner: userId });
    const workspaceIds = userWorkspaces.map(ws => ws._id);

    // Kullanıcının sahip olduğu sayfaları bul
    const userPages = await Page.find({ owner: userId });
    const pageIds = userPages.map(page => page._id);

    // İlişkili verileri sil
    await Promise.all([
      // Kullanıcının sahip olduğu workspace'leri sil
      Workspace.deleteMany({ owner: userId }),
      
      // Kullanıcının sahip olduğu sayfaları sil
      Page.deleteMany({ owner: userId }),
      
      // Diğer workspace'lerden kullanıcıyı member listesinden çıkar
      Workspace.updateMany(
        { 'members.user': userId },
        { $pull: { members: { user: userId } } }
      ),
      
      // Diğer sayfalardan kullanıcıyı invitedUsers listesinden çıkar
      Page.updateMany(
        { 'permissions.invitedUsers.user': userId },
        { $pull: { 'permissions.invitedUsers': { user: userId } } }
      ),
      
      // Diğer kullanıcıların favoritePages listesinden bu kullanıcının sayfalarını çıkar
      User.updateMany(
        { favoritePages: { $in: pageIds } },
        { $pull: { favoritePages: { $in: pageIds } } }
      ),
      
      // Diğer kullanıcıların workspaces listesinden bu kullanıcının workspace'lerini çıkar
      User.updateMany(
        { workspaces: { $in: workspaceIds } },
        { $pull: { workspaces: { $in: workspaceIds } } }
      )
    ]);

    // Kullanıcıyı sil
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Hesap ve ilişkili tüm veriler başarıyla silindi'
    });
  } catch (error) {
    console.error('Hesap silme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Hesap silme işlemi başarısız',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  deleteAccount,
}; 