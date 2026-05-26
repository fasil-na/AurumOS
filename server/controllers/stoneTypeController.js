import StoneType from '../models/StoneType.js';

export const createStoneType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Stone type name is required' });
    }

    const stoneType = new StoneType({
      name: name.toLowerCase(),
      workspace: req.user.workspace
    });
    await stoneType.save();
    res.status(201).json({ message: 'Stone type created successfully', stoneType });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Stone type already exists' });
    }
    console.error('Error creating stone type:', error);
    res.status(500).json({ error: 'Failed to create stone type' });
  }
};

export const getStoneTypes = async (req, res) => {
  try {
    const stoneTypes = await StoneType.find({ workspace: req.user.workspace }).sort({ name: 1 });
    res.status(200).json({ stoneTypes });
  } catch (error) {
    console.error('Error fetching stone types:', error);
    res.status(500).json({ error: 'Failed to fetch stone types' });
  }
};

export const deleteStoneType = async (req, res) => {
  try {
    const { id } = req.params;
    await StoneType.findOneAndDelete({ _id: id, workspace: req.user.workspace });
    res.status(200).json({ message: 'Stone type deleted successfully' });
  } catch (error) {
    console.error('Error deleting stone type:', error);
    res.status(500).json({ error: 'Failed to delete stone type' });
  }
};
