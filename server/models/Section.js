import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Section', sectionSchema);
