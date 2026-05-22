import express from 'express';
const router = express.Router();
import { createSection, 
  getSections, 
  updateSection, 
  deleteSection } from '../controllers/sectionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

// All routes require authentication
router.use(authenticate);

// Everyone in the workspace can view sections
router.get('/', getSections);

// Only Admins can manage sections
router.post('/', authorizeRoles('Admin'), createSection);
router.put('/:id', authorizeRoles('Admin'), updateSection);
router.delete('/:id', authorizeRoles('Admin'), deleteSection);

export default router;
