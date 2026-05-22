const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerEmail: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
