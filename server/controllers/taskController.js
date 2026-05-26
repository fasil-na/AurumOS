import Task from '../models/Task.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Section from '../models/Section.js';
import MaterialReceipt from '../models/MaterialReceipt.js';

export const getDependencies = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;
    
    const products = await Product.find({ workspace: workspaceId }).populate('sections');
    const employees = await User.find({ workspace: workspaceId, role: 'Employee' }).populate('sections');
    const sections = await Section.find({ workspace: workspaceId });

    // Calculate balance
    const receipts = await MaterialReceipt.find({ workspace: workspaceId });
    const totalReceived = receipts.reduce((acc, curr) => acc + curr.weightReceived, 0);
    const tasks = await Task.find({ workspace: workspaceId });
    const totalAllocated = tasks.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const inventoryBalance = totalReceived - totalAllocated;

    res.json({ products, employees, sections, inventoryBalance });
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
    const { taskName, clientName, totalWeight, products } = req.body;
    const workspaceId = req.user.workspace;

    // Check inventory balance
    const receipts = await MaterialReceipt.find({ workspace: workspaceId });
    const totalReceived = receipts.reduce((acc, curr) => acc + curr.weightReceived, 0);
    const tasks = await Task.find({ workspace: workspaceId });
    const totalAllocated = tasks.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const inventoryBalance = totalReceived - totalAllocated;

    if (Number(totalWeight) > inventoryBalance) {
      return res.status(400).json({ error: `Insufficient inventory balance. Only ${inventoryBalance.toFixed(2)}g available.` });
    }

    const task = new Task({
      taskName,
      clientName,
      totalWeight,
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
      // Check inventory balance
      const receipts = await MaterialReceipt.find({ workspace: workspaceId });
      const totalReceived = receipts.reduce((acc, curr) => acc + curr.weightReceived, 0);
      const tasks = await Task.find({ workspace: workspaceId });
      const totalAllocated = tasks.reduce((acc, curr) => acc + curr.totalWeight, 0);
      
      // Balance currently available without this task's old weight
      const inventoryBalance = totalReceived - (totalAllocated - task.totalWeight);

      if (Number(totalWeight) > inventoryBalance) {
        return res.status(400).json({ error: `Insufficient inventory balance. Only ${inventoryBalance.toFixed(2)}g available.` });
      }
      task.totalWeight = totalWeight;
    }

    task.taskName = taskName || task.taskName;
    if (clientName !== undefined) task.clientName = clientName;
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
    const { status, outputWeight } = req.body;

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

    if (status) assignment.status = status;
    if (outputWeight !== undefined) assignment.outputWeight = outputWeight;

    // Check if product is completed
    const allAssignmentsCompleted = product.assignments.every(a => a.status === 'Completed');
    product.status = allAssignmentsCompleted ? 'Completed' : 'In Progress';

    // Check if task is completed
    const allProductsCompleted = task.products.every(p => p.status === 'Completed');
    task.status = allProductsCompleted ? 'Completed' : 'In Progress';

    await task.save();
    res.json({ message: 'Status updated successfully', task });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Server error while updating assignment' });
  }
};
