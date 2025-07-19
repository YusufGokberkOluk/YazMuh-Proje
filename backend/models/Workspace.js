const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace adı gereklidir'],
    trim: true,
    minlength: [1, 'Workspace adı en az 1 karakter olmalıdır']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Workspace sahibi gereklidir']
  },
  pages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }],
  members: [{
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
}, {
  timestamps: true
});

// Workspace oluşturulduğunda owner'ı members listesine ekle
workspaceSchema.pre('save', function(next) {
  if (this.isNew) {
    // Owner'ın zaten members listesinde olup olmadığını kontrol et
    const ownerExists = this.members.some(member => 
      member.user.toString() === this.owner.toString()
    );
    
    if (!ownerExists) {
      this.members.push({
        user: this.owner,
        role: 'editor'
      });
    }
  }
  next();
});

module.exports = mongoose.model('Workspace', workspaceSchema); 