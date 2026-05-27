import MaterialReceipt from '../models/MaterialReceipt.js';
import Task from '../models/Task.js';

export const getInventoryStats = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;

    const receipts = await MaterialReceipt.find({ workspace: workspaceId })
      .populate('receivedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const totalReceived = receipts.reduce((acc, curr) => {
      if (curr.transactionType === 'Return') return acc - curr.weightReceived;
      return acc + curr.weightReceived;
    }, 0);

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
    const stoneInventoryByCarats = {};
    const goldByPurity = {};
    let availableStones = [];
    let totalFineGold = 0;

    const sortedReceipts = [...receipts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let remainingAllocationToDeduct = totalAllocatedToTasks;
    let totalIndebtedness = 0;

    sortedReceipts.forEach(r => {
      if (r.weightReceived > 0) {
        const purityVal = r.purity ? Number(r.purity) : 0;
        const multiplier = purityVal > 100 ? purityVal / 1000 : purityVal / 100;
        const fineGoldValue = r.weightReceived * multiplier;

        if (r.transactionType === 'Return') {
          const purity = r.purity ? r.purity.toString() : 'Unknown';
          goldByPurity[purity] = (goldByPurity[purity] || 0) - r.weightReceived;
          if (purityVal > 0) {
            totalFineGold -= fineGoldValue;
            totalIndebtedness -= fineGoldValue;
          }
        } else {
          if (purityVal > 0) {
            totalIndebtedness += fineGoldValue;
          }

          let availableFromReceipt = r.weightReceived;
          if (remainingAllocationToDeduct > 0) {
            if (remainingAllocationToDeduct >= availableFromReceipt) {
              remainingAllocationToDeduct -= availableFromReceipt;
              availableFromReceipt = 0;
            } else {
              availableFromReceipt -= remainingAllocationToDeduct;
              remainingAllocationToDeduct = 0;
            }
          }
          if (availableFromReceipt > 0) {
            const purity = r.purity ? r.purity.toString() : 'Unknown';
            goldByPurity[purity] = (goldByPurity[purity] || 0) + availableFromReceipt;

            if (purityVal > 0) {
              totalFineGold += availableFromReceipt * multiplier;
            }
          }
        }
      }

      if (r.stones && r.stones.length > 0) {
        if (r.transactionType === 'Return') {
          r.stones.forEach(stone => {
            if (!stone.type) return;
            const type = stone.type.trim().toLowerCase();
            let qtyToDeduct = Number(stone.quantity);

            for (let i = 0; i < availableStones.length && qtyToDeduct > 0; i++) {
              if (availableStones[i].type === type && availableStones[i].quantity > 0) {
                if (availableStones[i].quantity >= qtyToDeduct) {
                  availableStones[i].quantity -= qtyToDeduct;
                  qtyToDeduct = 0;
                } else {
                  qtyToDeduct -= availableStones[i].quantity;
                  availableStones[i].quantity = 0;
                }
              }
            }
          });
        } else {
          r.stones.forEach(stone => {
            if (!stone.type) return;
            availableStones.push({
              type: stone.type.trim().toLowerCase(),
              carats: stone.carats || null,
              quantity: Number(stone.quantity)
            });
          });
        }
      }
    });

    tasks.forEach(task => {
      if (task.products && task.products.length > 0) {
        task.products.forEach(prod => {
          if (prod.stones && prod.stones.length > 0) {
            prod.stones.forEach(stone => {
              if (!stone.type) return;
              const type = stone.type.trim().toLowerCase();
              let qtyToDeduct = Number(stone.quantity);

              for (let i = 0; i < availableStones.length && qtyToDeduct > 0; i++) {
                if (availableStones[i].type === type && availableStones[i].quantity > 0) {
                  if (availableStones[i].quantity >= qtyToDeduct) {
                    availableStones[i].quantity -= qtyToDeduct;
                    qtyToDeduct = 0;
                  } else {
                    qtyToDeduct -= availableStones[i].quantity;
                    availableStones[i].quantity = 0;
                  }
                }
              }
            });
          }
        });
      }
    });

    availableStones.forEach(st => {
      if (st.quantity > 0) {
        stoneInventory[st.type] = (stoneInventory[st.type] || 0) + st.quantity;
        const key = `${st.type}|${st.carats || 'N/A'}`;
        if (!stoneInventoryByCarats[key]) {
          stoneInventoryByCarats[key] = { type: st.type, carats: st.carats, quantity: 0 };
        }
        stoneInventoryByCarats[key].quantity += st.quantity;
      }
    });

    res.json({
      balance,
      totalReceived,
      totalAllocatedToTasks,
      receipts,
      stoneInventory,
      stoneInventoryByCarats,
      goldByPurity,
      totalFineGold,
      sectionAllocations,
      totalIndebtedness
    });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ error: 'Server error while fetching inventory data' });
  }
};

export const addMaterialReceipt = async (req, res) => {
  try {
    const { weightReceived, purity, stones, notes, transactionType } = req.body;
    
    if (stones && stones.length > 0) {
      // It's a stone receipt
      for (const stone of stones) {
        if (!stone.type) {
          return res.status(400).json({ error: 'Stone type is required' });
        }
        if (!stone.carats || Number(stone.carats) <= 0) {
          return res.status(400).json({ error: 'Carats must be greater than 0 for all stones' });
        }
        if (!stone.quantity || Number(stone.quantity) <= 0) {
          return res.status(400).json({ error: 'Quantity must be greater than 0 for all stones' });
        }
      }
    } else {
      // It's a gold receipt
      if (!weightReceived || isNaN(weightReceived) || Number(weightReceived) <= 0) {
        return res.status(400).json({ error: 'Valid weight greater than 0 is required' });
      }
      if (purity === undefined || purity === null || isNaN(purity) || Number(purity) <= 0 || Number(purity) > 100) {
        return res.status(400).json({ error: 'Valid purity percentage between 0.01 and 100 is required for gold' });
      }
    }

    const receipt = new MaterialReceipt({
      workspace: req.user.workspace,
      weightReceived: weightReceived ? Number(weightReceived) : 0,
      purity: purity ? Number(purity) : undefined,
      stones: stones || [],
      receivedBy: req.user._id,
      source: 'Stellar',
      transactionType: transactionType || 'Receive',
      notes
    });

    await receipt.save();

    res.status(201).json({ message: 'Material receipt added successfully', receipt });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ error: 'Server error while adding material receipt' });
  }
};
