const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag adı gereklidir'],
    unique: true,
    trim: true,
    minlength: [1, 'Tag adı en az 1 karakter olmalıdır']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'Workspace gereklidir']
  }
}, {
  timestamps: true
});

// Tag adını küçük harfe çevir ve boşlukları temizle
tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase().trim();
  }
  next();
});

// Compound index: workspace ve name birlikte benzersiz olmalı
tagSchema.index({ workspace: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema); 