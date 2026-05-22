const express = require('express');
const router = express.Router();
const { 
  createSection, 
  getSections, 
  updateSection, 
  deleteSection 
} = require('../controllers/sectionController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

// All routes require authentication
router.use(authenticate);

// Everyone in the workspace can view sections
router.get('/', getSections);

// Only Admins can manage sections
router.post('/', authorizeRoles('Admin'), createSection);
router.put('/:id', authorizeRoles('Admin'), updateSection);
router.delete('/:id', authorizeRoles('Admin'), deleteSection);

module.exports = router;
