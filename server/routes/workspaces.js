const express = require('express');
const router = express.Router();
const { getWorkspaces } = require('../controllers/workspaceController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

// Require authentication and Super Admin role to view all workspaces
router.get(
  '/',
  authenticate,
  authorizeRoles('Super Admin'),
  getWorkspaces
);

module.exports = router;
