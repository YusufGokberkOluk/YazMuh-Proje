const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sayfa sahibi gereklidir']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'Workspace gereklidir']
  },
  permissions: {
    publicAccess: {
      type: String,
      enum: ['none', 'read-only'],
      default: 'none'
    },
    shareLink: {
      type: String,
      unique: true,
      sparse: true // null değerler için unique constraint'i devre dışı bırak
    },
    invitedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['editor', 'viewer'],
        default: 'viewer'
      }
    }]
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Share link oluşturma metodu
pageSchema.methods.generateShareLink = function() {
  const crypto = require('crypto');
  this.permissions.shareLink = crypto.randomBytes(16).toString('hex');
  return this.permissions.shareLink;
};

// Paylaşım linkini temizleme metodu
pageSchema.methods.clearShareLink = function() {
  this.permissions.shareLink = null;
  return this;
};

module.exports = mongoose.model('Page', pageSchema); 