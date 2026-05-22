const bcrypt = require('bcryptjs');
const { generateRandomToken } = require('../utils/tokens');
const { sendEmail } = require('../utils/email');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

const inviteUser = async (req, res) => {
  try {
    const { email, role, workspaceName, sections } = req.body;
    const inviter = req.user;

    // Strict role validation based on requirements
    if (inviter.role === 'Super Admin' && role !== 'Admin') {
      return res.status(403).json({ error: 'Super Admin can only invite Admins' });
    }
    
    if (inviter.role === 'Admin' && !['Admin', 'Employee'].includes(role)) {
      return res.status(403).json({ error: 'Admin can only invite Admins or Employees' });
    }

    if (inviter.role === 'Employee') {
      return res.status(403).json({ error: 'Employees cannot invite users' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const existingInvite = await Invitation.findOne({ 
      email, 
      status: 'pending',
      expiresAt: { $gt: Date.now() }
    });

    if (existingInvite) {
      return res.status(400).json({ error: 'A pending invitation already exists for this email' });
    }

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let workspaceId = null;
    if (inviter.role === 'Super Admin' && role === 'Admin' && workspaceName) {
      const Workspace = require('../models/Workspace');
      const workspace = await Workspace.create({ name: workspaceName, ownerEmail: email });
      workspaceId = workspace._id;
    } else if (inviter.role === 'Admin') {
      workspaceId = inviter.workspace;
    }

    const invitation = await Invitation.create({
      email,
      role,
      token,
      invitedBy: inviter.id === 'superadmin' ? null : inviter._id, // Handle Super Admin as inviter
      expiresAt,
      workspace: workspaceId,
      sections: sections || []
    });

    const acceptUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: `Invitation to join as ${role}`,
      html: `
        <h2>You've been invited!</h2>
        <p>You have been invited to join AurumOS as an ${role}.</p>
        <p>Click the link below to accept the invitation and set up your account:</p>
        <p><a href="${acceptUrl}">Accept Invitation</a></p>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.status(201).json({ success: true, message: 'Invitation sent successfully', invitation });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Error sending invitation' });
  }
};

const getInvitations = async (req, res) => {
  try {
    const inviter = req.user;
    let query = {};

    if (inviter.role === 'Admin') {
      query.invitedBy = inviter._id;
    } else if (inviter.role === 'Super Admin') {
      query.invitedBy = null; // Assuming Super Admin invites have null invitedBy, or we store 'superadmin' string which requires changing schema
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const invitations = await Invitation.find(query).sort({ createdAt: -1 });
    res.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Error fetching invitations' });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.query;
    const { firstName, lastName, mobileNumber, password } = req.body;

    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: Date.now() }
    });

    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      mobileNumber,
      email: invitation.email,
      passwordHash,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      workspace: invitation.workspace,
      sections: invitation.sections || []
    });

    if (user.role === 'Admin' && invitation.workspace) {
      const Workspace = require('../models/Workspace');
      const workspace = await Workspace.findById(invitation.workspace);
      if (workspace && !workspace.owner) {
        workspace.owner = user._id;
        await workspace.save();
      }
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    res.status(201).json({ success: true, message: 'Account created successfully', user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Error accepting invitation' });
  }
};

const validateInvitation = async (req, res) => {
  try {
    const { token } = req.query;

    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: Date.now() }
    });

    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }

    res.json({ email: invitation.email, role: invitation.role });
  } catch (error) {
    console.error('Validate invitation error:', error);
    res.status(500).json({ error: 'Error validating invitation' });
  }
};

const revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const inviter = req.user;

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (
      (inviter.role === 'Admin' && invitation.invitedBy?.toString() !== inviter._id.toString()) ||
      (inviter.role === 'Super Admin' && invitation.invitedBy !== null)
    ) {
      return res.status(403).json({ error: 'Not authorized to revoke this invitation' });
    }

    invitation.status = 'revoked';
    await invitation.save();

    res.json({ success: true, message: 'Invitation revoked successfully' });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    res.status(500).json({ error: 'Error revoking invitation' });
  }
};

module.exports = {
  inviteUser,
  getInvitations,
  acceptInvitation,
  revokeInvitation,
  validateInvitation
};
