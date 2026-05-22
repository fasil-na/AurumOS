const Section = require('../models/Section');

// @desc    Create a new section
// @route   POST /api/sections
// @access  Private (Admin only)
exports.createSection = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    if (!req.user.workspace) {
      return res.status(403).json({ message: 'You must belong to a workspace to create a section' });
    }

    const section = new Section({
      name,
      workspace: req.user.workspace
    });

    await section.save();

    res.status(201).json({ message: 'Section created successfully', section });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error while creating section' });
  }
};

// @desc    Get all sections for the current workspace
// @route   GET /api/sections
// @access  Private
exports.getSections = async (req, res) => {
  try {
    if (!req.user.workspace) {
      return res.status(403).json({ message: 'You must belong to a workspace to view sections' });
    }

    const sections = await Section.find({ workspace: req.user.workspace }).sort({ createdAt: -1 });
    
    res.json({ sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error while fetching sections' });
  }
};

// @desc    Update a section
// @route   PUT /api/sections/:id
// @access  Private (Admin only)
exports.updateSection = async (req, res) => {
  try {
    const { name } = req.body;
    const section = await Section.findOne({ _id: req.params.id, workspace: req.user.workspace });

    if (!section) {
      return res.status(404).json({ message: 'Section not found in your workspace' });
    }

    section.name = name || section.name;
    await section.save();

    res.json({ message: 'Section updated successfully', section });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Server error while updating section' });
  }
};

// @desc    Delete a section
// @route   DELETE /api/sections/:id
// @access  Private (Admin only)
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findOne({ _id: req.params.id, workspace: req.user.workspace });

    if (!section) {
      return res.status(404).json({ message: 'Section not found in your workspace' });
    }

    await section.deleteOne();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Server error while deleting section' });
  }
};
