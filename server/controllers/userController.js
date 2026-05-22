const User = require('../models/User');

const getEmployees = async (req, res) => {
  try {
    let query = { role: 'Employee' };
    if (req.user && req.user.workspace) {
      query.workspace = req.user.workspace;
    }
    const employees = await User.find(query).populate('sections').select('-passwordHash');
    res.json({ success: true, employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Error fetching employees' });
  }
};

const verifyEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (employee.role !== 'Employee') {
      return res.status(400).json({ error: 'Can only verify employees' });
    }

    employee.isVerified = true;
    await employee.save();

    res.json({ success: true, message: 'Employee verified successfully', employee });
  } catch (error) {
    console.error('Verify employee error:', error);
    res.status(500).json({ error: 'Error verifying employee' });
  }
};

const updateEmployeeSections = async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;

    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (employee.role !== 'Employee') {
      return res.status(400).json({ error: 'Can only update sections for employees' });
    }

    employee.sections = sections || [];
    await employee.save();

    res.json({ success: true, message: 'Employee sections updated successfully', employee });
  } catch (error) {
    console.error('Update employee sections error:', error);
    res.status(500).json({ error: 'Error updating employee sections' });
  }
};

module.exports = {
  getEmployees,
  verifyEmployee,
  updateEmployeeSections
};
