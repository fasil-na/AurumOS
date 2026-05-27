import Supplier from '../models/Supplier.js';

export const createSupplier = async (req, res) => {
  try {
    const { name, isInternal } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const supplier = new Supplier({
      name: name.trim(),
      isInternal: isInternal || false,
      workspace: req.user.workspace
    });
    await supplier.save();
    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Supplier already exists' });
    }
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ workspace: req.user.workspace }).sort({ name: 1 });
    res.status(200).json({ suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await Supplier.findOneAndDelete({ _id: id, workspace: req.user.workspace });
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};
