import express from 'express';
const router = express.Router();
import { inviteUser, getInvitations, acceptInvitation, revokeInvitation, validateInvitation } from '../controllers/inviteController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { validateRequest, inviteUserSchema, acceptInviteSchema } from '../validations/auth.validation.js';

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

export default router;
