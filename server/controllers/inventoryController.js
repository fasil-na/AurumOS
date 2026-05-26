import MaterialReceipt from '../models/MaterialReceipt.js';
import Task from '../models/Task.js';

export const getInventoryStats = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;

    const receipts = await MaterialReceipt.find({ workspace: workspaceId })
      .populate('receivedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const totalReceived = receipts.reduce((acc, curr) => acc + curr.weightReceived, 0);

    const tasks = await Task.find({ workspace: workspaceId })
      .populate('products.product')
      .populate('products.assignments.section');
      
    const totalAllocatedToTasks = tasks.reduce((acc, curr) => acc + curr.totalWeight, 0);

    const balance = totalReceived - totalAllocatedToTasks;

    const sectionAllocations = {};
    tasks.forEach(task => {
      if (task.status === 'Completed') return;

      task.products.forEach(product => {
        if (product.status === 'Completed') return;

        const assignmentIndex = product.assignments.findIndex(a => a.status !== 'Completed');
        if (assignmentIndex === -1) return;
        
        const currentAssignment = product.assignments[assignmentIndex];
        const sectionName = currentAssignment.section ? currentAssignment.section.name : 'Unknown';

        let inputWeight = 0;
        if (assignmentIndex === 0) {
          inputWeight = product.product ? (product.product.weight * product.quantity) : task.totalWeight;
        } else {
          inputWeight = product.assignments[assignmentIndex - 1].outputWeight || 0;
        }

        sectionAllocations[sectionName] = (sectionAllocations[sectionName] || 0) + inputWeight;
      });
    });

    const stoneInventory = {};
    receipts.forEach(r => {
      if (r.stones && r.stones.length > 0) {
        r.stones.forEach(stone => {
          stoneInventory[stone.type] = (stoneInventory[stone.type] || 0) + stone.quantity;
        });
      }
    });

    res.json({
      balance,
      totalReceived,
      totalAllocatedToTasks,
      receipts,
      stoneInventory,
      sectionAllocations
    });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ error: 'Server error while fetching inventory data' });
  }
};

export const addMaterialReceipt = async (req, res) => {
  try {
    const { weightReceived, stones, notes } = req.body;
    
    if ((!weightReceived || isNaN(weightReceived) || Number(weightReceived) <= 0) && (!stones || stones.length === 0)) {
      return res.status(400).json({ error: 'Valid weight or stones are required' });
    }

    const receipt = new MaterialReceipt({
      workspace: req.user.workspace,
      weightReceived: weightReceived ? Number(weightReceived) : 0,
      stones: stones || [],
      receivedBy: req.user._id,
      source: 'Stellar',
      notes
    });

    await receipt.save();

    res.status(201).json({ message: 'Material receipt added successfully', receipt });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ error: 'Server error while adding material receipt' });
  }
};
