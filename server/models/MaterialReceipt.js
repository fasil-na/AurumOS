import mongoose from 'mongoose';

const materialReceiptSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  weightReceived: { type: Number, default: 0 },
  purity: { type: Number },
  pureWeight: { type: Number },
  stones: [{
    type: { type: String, required: true },
    shape: { type: String },
    size: { type: Number },
    length: { type: Number },
    width: { type: Number },
    carats: { type: Number },
    quantity: { type: Number, required: true }
  }],
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  transactionType: { type: String, enum: ['Receive', 'Return'], required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('MaterialReceipt', materialReceiptSchema);
