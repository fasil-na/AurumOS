const express = require('express');
const router = express.Router();
const { inviteUser, getInvitations, acceptInvitation, revokeInvitation, validateInvitation } = require('../controllers/inviteController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { validateRequest, inviteUserSchema, acceptInviteSchema } = require('../validations/auth.validation');

// Require authentication and specific roles to send invites
router.post(
  '/', 
  authenticate, 
  authorizeRoles('Super Admin', 'Admin'), 
  validateRequest(inviteUserSchema), 
  inviteUser
);

// Get invitations sent by the user
router.get(
  '/', 
  authenticate, 
  authorizeRoles('Super Admin', 'Admin'), 
  getInvitations
);

// Validate invitation
router.get('/validate', validateInvitation);

// Public route to accept an invitation
router.post(
  '/accept', 
  validateRequest(acceptInviteSchema), 
  acceptInvitation
);

// Revoke an invitation
router.delete(
  '/:id', 
  authenticate, 
  authorizeRoles('Super Admin', 'Admin'), 
  revokeInvitation
);

module.exports = router;
