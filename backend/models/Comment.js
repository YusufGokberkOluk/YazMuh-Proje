const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Yorum içeriği gereklidir'],
    trim: true
  },
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Yorum sıralaması için index
commentSchema.index({ page: 1, createdAt: -1 });
commentSchema.index({ block: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: 1 });

// Mention'ları otomatik olarak bul ve ekle
commentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // @username formatındaki mention'ları bul
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push(match[1]);
    }
    
    // Bu aşamada sadece regex'i kaydet, gerçek kullanıcı ID'leri controller'da eklenecek
    this.metadata = { ...this.metadata, mentionUsernames: mentions };
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema); 