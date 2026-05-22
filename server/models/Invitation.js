import mongoose from 'mongoose';

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
    default: null
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
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

export default mongoose.model('Invitation', invitationSchema);
