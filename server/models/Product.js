import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, unique: true },
  weight: { type: Number, required: true },
  images: [{ type: String }],
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
