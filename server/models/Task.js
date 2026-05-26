import mongoose from 'mongoose';

const productAssignmentSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  outputWeight: { type: Number }
});

const taskProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  urgencyLevel: { type: String, enum: ['Low', 'Normal', 'Urgent'], default: 'Normal' },
  assignments: [productAssignmentSchema],
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
});

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  clientName: { type: String },
  totalWeight: { type: Number, required: true },
  products: [taskProductSchema],
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
