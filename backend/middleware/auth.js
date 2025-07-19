const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Page = require('../models/Page');
const { isBlocklisted } = require('../config/redis');

// JWT token doğrulama middleware
const protect = async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı al
      token = req.headers.authorization.split(' ')[1];

      // Redis blocklist kontrolü
      const isTokenBlocklisted = await isBlocklisted(token);
      if (isTokenBlocklisted) {
        return res.status(401).json({ 
          success: false,
          message: 'Token geçersiz - çıkış yapılmış' 
        });
      }

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı bul
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Geçersiz token - kullanıcı bulunamadı' 
        });
      }

      next();
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Geçersiz token' 
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token süresi dolmuş' 
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Token doğrulama hatası' 
        });
      }
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Erişim reddedildi - token bulunamadı' 
    });
  }
};

// Admin yetkisi kontrolü middleware (gelecekte kullanılabilir)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Admin yetkisi gereklidir' 
    });
  }
};

// Workspace sahibi kontrolü middleware
const workspaceOwner = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID gereklidir'
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace bulunamadı'
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için workspace sahibi olmanız gereklidir'
      });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    console.error('Workspace sahibi kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// Sayfa sahibi kontrolü middleware
const pageOwner = async (req, res, next) => {
  try {
    const pageId = req.params.pageId || req.body.pageId;
    
    if (!pageId) {
      return res.status(400).json({
        success: false,
        message: 'Sayfa ID gereklidir'
      });
    }

    const page = await Page.findById(pageId);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    if (page.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için sayfa sahibi olmanız gereklidir'
      });
    }

    req.page = page;
    next();
  } catch (error) {
    console.error('Sayfa sahibi kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

module.exports = { 
  protect, 
  admin, 
  workspaceOwner, 
  pageOwner 
}; 