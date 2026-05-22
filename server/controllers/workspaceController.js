const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find().populate('owner', 'email firstName lastName');
    
    const formattedWorkspaces = workspaces.map(ws => {
      const wsObj = ws.toObject();
      if (wsObj.owner) {
        return wsObj;
      } else {
        return {
          ...wsObj,
          owner: { email: wsObj.ownerEmail ? `${wsObj.ownerEmail} (Pending)` : 'Unknown' }
        };
      }
    });

    res.json({ workspaces: formattedWorkspaces });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
