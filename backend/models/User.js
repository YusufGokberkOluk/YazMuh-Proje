const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gereklidir'],
    unique: true,
    trim: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır']
  },
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  fullName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }],
  favoritePages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }],
  preferences: {
    pageViewMode: {
      type: String,
      enum: ['list', 'grid'],
      default: 'list'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'tr'
    }
  },
  notificationSettings: {
    email: {
      pageInvites: { type: Boolean, default: true },
      commentMentions: { type: Boolean, default: true },
      commentReplies: { type: Boolean, default: true },
      workspaceInvites: { type: Boolean, default: true },
      pageShares: { type: Boolean, default: true }
    },
    push: {
      pageInvites: { type: Boolean, default: true },
      commentMentions: { type: Boolean, default: true },
      commentReplies: { type: Boolean, default: true },
      workspaceInvites: { type: Boolean, default: true },
      pageShares: { type: Boolean, default: true }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Şifreyi hashleme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Son aktif zamanı güncelle
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 