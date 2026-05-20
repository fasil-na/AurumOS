const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
