import mongoose from 'mongoose';

const stoneTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('StoneType', stoneTypeSchema);
