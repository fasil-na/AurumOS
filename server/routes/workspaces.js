import express from 'express';
const router = express.Router();
import { getWorkspaces } from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

// Require authentication and Super Admin role to view all workspaces
router.get(
  '/',
  authenticate,
  authorizeRoles('Super Admin'),
  getWorkspaces
);

export default router;
