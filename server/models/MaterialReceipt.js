import mongoose from 'mongoose';

const materialReceiptSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  weightReceived: { type: Number, default: 0 },
  stones: [{
    type: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, default: 'Stellar' },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('MaterialReceipt', materialReceiptSchema);
