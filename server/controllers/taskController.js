import Task from '../models/Task.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Section from '../models/Section.js';
import MaterialReceipt from '../models/MaterialReceipt.js';
import Supplier from '../models/Supplier.js';

export const getDependencies = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;
    
    const products = await Product.find({ workspace: workspaceId }).populate('sections');
    const employees = await User.find({ workspace: workspaceId, role: 'Employee' }).populate('sections');
    const sections = await Section.find({ workspace: workspaceId });

    const goldByPurity = {};
    const receipts = await MaterialReceipt.find({ workspace: workspaceId });
    const tasks = await Task.find({ workspace: workspaceId });

    receipts.forEach(r => {
      if (r.weightReceived > 0) {
        const purity = r.purity ? r.purity.toString() : 'Unknown';
        if (r.transactionType === 'Return') {
          goldByPurity[purity] = (goldByPurity[purity] || 0) - r.weightReceived;
        } else {
          goldByPurity[purity] = (goldByPurity[purity] || 0) + r.weightReceived;
        }
      }
    });

    tasks.forEach(task => {
      const purity = task.purity ? task.purity.toString() : 'Unknown';
      goldByPurity[purity] = (goldByPurity[purity] || 0) - task.totalWeight;
    });

    const stoneInventory = {};
    receipts.forEach(r => {
      if (r.stones && r.stones.length > 0) {
        r.stones.forEach(stone => {
          if (!stone.type) return;
          const type = stone.type.trim().toLowerCase();
          stoneInventory[type] = (stoneInventory[type] || 0) + Number(stone.quantity);
        });
      }
    });

    tasks.forEach(task => {
      if (task.products && task.products.length > 0) {
        task.products.forEach(prod => {
          if (prod.stones && prod.stones.length > 0) {
            prod.stones.forEach(stone => {
              if (!stone.type) return;
              const type = stone.type.trim().toLowerCase();
              if (stoneInventory[type]) {
                stoneInventory[type] -= Number(stone.quantity);
              }
            });
          }
        });
      }
    });

    res.json({ products, employees, sections, goldByPurity, stoneInventory });
  } catch (error) {
    console.error('Fetch dependencies error:', error);
    res.status(500).json({ error: 'Server error while fetching dependencies' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const query = req.user.role !== 'Super Admin' && req.user.workspace ? { workspace: req.user.workspace } : {};
    
    const tasks = await Task.find(query)
      .populate({
        path: 'products.product',
        populate: { path: 'sections' }
      })
      .populate('products.assignments.section')
      .populate('products.assignments.employee')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { taskName, clientName, totalWeight, purity, products } = req.body;
    const workspaceId = req.user.workspace;

    const goldByPurity = {};
    const receipts = await MaterialReceipt.find({ workspace: workspaceId });
    const tasks = await Task.find({ workspace: workspaceId });

    receipts.forEach(r => {
      if (r.weightReceived > 0) {
        const p = r.purity ? r.purity.toString() : 'Unknown';
        if (r.transactionType === 'Return') {
          goldByPurity[p] = (goldByPurity[p] || 0) - r.weightReceived;
        } else {
          goldByPurity[p] = (goldByPurity[p] || 0) + r.weightReceived;
        }
      }
    });

    tasks.forEach(t => {
      const p = t.purity ? t.purity.toString() : 'Unknown';
      goldByPurity[p] = (goldByPurity[p] || 0) - t.totalWeight;
    });

    const reqPurity = req.body.purity ? req.body.purity.toString() : 'Unknown';
    const inventoryBalance = goldByPurity[reqPurity] || 0;

    if (Number(totalWeight) > inventoryBalance) {
      return res.status(400).json({ error: `Insufficient inventory balance. Only ${inventoryBalance.toFixed(2)}g of ${reqPurity} purity available.` });
    }

    const task = new Task({
      taskName,
      clientName,
      totalWeight,
      purity,
      products,
      workspace: workspaceId,
      createdBy: req.user._id
    });

    await task.save();
    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error while creating task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskName, clientName, totalWeight, products } = req.body;
    const workspaceId = req.user.workspace;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (totalWeight && Number(totalWeight) !== task.totalWeight) {
      const goldByPurity = {};
      const receipts = await MaterialReceipt.find({ workspace: workspaceId });
      const tasks = await Task.find({ workspace: workspaceId });

      receipts.forEach(r => {
        if (r.weightReceived > 0) {
          const p = r.purity ? r.purity.toString() : 'Unknown';
          if (r.transactionType === 'Return') {
            goldByPurity[p] = (goldByPurity[p] || 0) - r.weightReceived;
          } else {
            goldByPurity[p] = (goldByPurity[p] || 0) + r.weightReceived;
          }
        }
      });

      tasks.forEach(t => {
        if (t._id.toString() !== task._id.toString()) {
          const p = t.purity ? t.purity.toString() : 'Unknown';
          goldByPurity[p] = (goldByPurity[p] || 0) - t.totalWeight;
        }
      });

      const reqPurity = req.body.purity ? req.body.purity.toString() : (task.purity ? task.purity.toString() : 'Unknown');
      const inventoryBalance = goldByPurity[reqPurity] || 0;

      if (Number(totalWeight) > inventoryBalance) {
        return res.status(400).json({ error: `Insufficient inventory balance. Only ${inventoryBalance.toFixed(2)}g of ${reqPurity} purity available.` });
      }
      task.totalWeight = totalWeight;
    }

    task.taskName = taskName || task.taskName;
    if (clientName !== undefined) task.clientName = clientName;
    if (req.body.purity !== undefined) task.purity = req.body.purity;
    if (products) task.products = products;

    await task.save();
    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error while updating task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error while deleting task' });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  try {
    const { taskId, productId, assignmentId } = req.params;
    const { status, outputWeight, inputWeight } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const product = task.products.id(productId);
    if (!product) return res.status(404).json({ error: 'Product not found in task' });

    const assignment = product.assignments.id(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Verify employee authorization
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin' && assignment.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this assignment' });
    }

    const wasPendingQC = assignment.status === 'Pending QC';
    if (status) assignment.status = status;
    if (outputWeight !== undefined) assignment.outputWeight = outputWeight;
    if (inputWeight !== undefined) assignment.inputWeight = inputWeight;

    // If Admin is approving from Pending QC to Completed, calculate and record the loss
    if (wasPendingQC && status === 'Completed' && assignment.inputWeight !== undefined && assignment.outputWeight !== undefined) {
      const loss = assignment.inputWeight - assignment.outputWeight;
      if (loss > 0 && assignment.employee) {
        await User.findByIdAndUpdate(assignment.employee, { $inc: { totalLossWeight: loss } });
      }
    }

    // Check if product is completed
    const allAssignmentsCompleted = product.assignments.every(a => a.status === 'Completed');
    product.status = allAssignmentsCompleted ? 'Completed' : (product.assignments.some(a => a.status === 'Pending QC') ? 'Pending QC' : 'In Progress');

    const wasTaskCompleted = task.status === 'Completed';

    // Check if task is completed
    const allProductsCompleted = task.products.every(p => p.status === 'Completed');
    task.status = allProductsCompleted ? 'Completed' : (task.products.some(p => p.status === 'Pending QC') ? 'Pending QC' : 'In Progress');

    await task.save();

    // If task just became completed, return the final output weight to inventory
    if (!wasTaskCompleted && task.status === 'Completed') {
      let totalFinalOutput = 0;
      task.products.forEach(p => {
        if (p.assignments && p.assignments.length > 0) {
          const finalAssignment = p.assignments[p.assignments.length - 1];
          totalFinalOutput += (finalAssignment.outputWeight || 0);
        }
      });

      if (totalFinalOutput > 0) {
        let internalSupplier = await Supplier.findOne({ workspace: task.workspace, isInternal: true });
        if (!internalSupplier) {
          internalSupplier = await Supplier.create({
            name: 'Internal Production',
            isInternal: true,
            workspace: task.workspace
          });
        }

        await MaterialReceipt.create({
          workspace: task.workspace,
          weightReceived: totalFinalOutput,
          purity: task.purity,
          transactionType: 'Receive',
          receivedBy: req.user._id,
          source: internalSupplier._id,
          notes: `Completed output from Task: ${task.taskName}`
        });
      }
    }

    res.json({ message: 'Status updated successfully', task });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Server error while updating assignment' });
  }
};
