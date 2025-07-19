const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'text', 'heading1', 'heading2', 'heading3', 
      'image', 'list', 'code', 'quote', 'divider',
      'table', 'embed', 'file', 'checkbox'
    ],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    default: null
  },
  order: {
    type: Number,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Blok sıralaması için index
blockSchema.index({ page: 1, order: 1 });
blockSchema.index({ parent: 1, order: 1 });

// Blok silindiğinde alt blokları da sil
blockSchema.pre('remove', async function(next) {
  try {
    await this.constructor.deleteMany({ parent: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Block', blockSchema); 