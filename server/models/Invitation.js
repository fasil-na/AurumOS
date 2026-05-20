const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Employee'],
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'revoked'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
