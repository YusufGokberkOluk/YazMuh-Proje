const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendNotification } = require('../controllers/notificationController');

let io;

// Socket.IO başlat
const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Kimlik doğrulama middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('username email avatar');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Bağlantı yönetimi
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    // Kullanıcıyı workspace'e katıl
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      socket.workspaceId = workspaceId;
      console.log(`${socket.user.username} joined workspace: ${workspaceId}`);
    });

    // Workspace'den ayrıl
    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      socket.workspaceId = null;
      console.log(`${socket.user.username} left workspace: ${workspaceId}`);
    });

    // Sayfaya katıl
    socket.on('join-page', (pageId) => {
      socket.join(`page:${pageId}`);
      socket.pageId = pageId;
      console.log(`${socket.user.username} joined page: ${pageId}`);
      
      // Diğer kullanıcılara bildir
      socket.to(`page:${pageId}`).emit('user-joined-page', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Sayfadan ayrıl
    socket.on('leave-page', (pageId) => {
      socket.leave(`page:${pageId}`);
      socket.pageId = null;
      console.log(`${socket.user.username} left page: ${pageId}`);
      
      // Diğer kullanıcılara bildir
      socket.to(`page:${pageId}`).emit('user-left-page', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Blok güncelleme
    socket.on('block-update', (data) => {
      const { pageId, blockId, content, type, cursor } = data;
      
      // Aynı sayfadaki diğer kullanıcılara gönder
      socket.to(`page:${pageId}`).emit('block-updated', {
        blockId,
        content,
        type,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        cursor,
        timestamp: new Date()
      });
    });

    // Blok oluşturma
    socket.on('block-create', (data) => {
      const { pageId, blockData } = data;
      
      socket.to(`page:${pageId}`).emit('block-created', {
        blockData,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Blok silme
    socket.on('block-delete', (data) => {
      const { pageId, blockId } = data;
      
      socket.to(`page:${pageId}`).emit('block-deleted', {
        blockId,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Blok sıralama
    socket.on('block-reorder', (data) => {
      const { pageId, blocks } = data;
      
      socket.to(`page:${pageId}`).emit('blocks-reordered', {
        blocks,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Cursor pozisyonu
    socket.on('cursor-move', (data) => {
      const { pageId, cursor } = data;
      
      socket.to(`page:${pageId}`).emit('cursor-moved', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        cursor,
        timestamp: new Date()
      });
    });

    // Yorum ekleme
    socket.on('comment-add', (data) => {
      const { pageId, commentData } = data;
      
      socket.to(`page:${pageId}`).emit('comment-added', {
        commentData,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Yorum güncelleme
    socket.on('comment-update', (data) => {
      const { pageId, commentId, content } = data;
      
      socket.to(`page:${pageId}`).emit('comment-updated', {
        commentId,
        content,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Yorum silme
    socket.on('comment-delete', (data) => {
      const { pageId, commentId } = data;
      
      socket.to(`page:${pageId}`).emit('comment-deleted', {
        commentId,
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing-start', (data) => {
      const { pageId } = data;
      
      socket.to(`page:${pageId}`).emit('user-typing', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        isTyping: true,
        timestamp: new Date()
      });
    });

    socket.on('typing-stop', (data) => {
      const { pageId } = data;
      
      socket.to(`page:${pageId}`).emit('user-typing', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        isTyping: false,
        timestamp: new Date()
      });
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
      
      // Aktif sayfadan ayrıl
      if (socket.pageId) {
        socket.to(`page:${socket.pageId}`).emit('user-left-page', {
          user: {
            id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          timestamp: new Date()
        });
      }
    });
  });

  return io;
};

// Bildirim gönderme fonksiyonu
const sendNotificationToUser = (userId, notificationData) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notificationData);
  }
};

// Workspace bildirimi gönderme
const sendWorkspaceNotification = (workspaceId, notificationData) => {
  if (io) {
    io.to(`workspace:${workspaceId}`).emit('workspace-notification', notificationData);
  }
};

// Sayfa bildirimi gönderme
const sendPageNotification = (pageId, notificationData) => {
  if (io) {
    io.to(`page:${pageId}`).emit('page-notification', notificationData);
  }
};

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  sendWorkspaceNotification,
  sendPageNotification
}; 