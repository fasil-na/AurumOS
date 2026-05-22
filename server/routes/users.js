const express = require('express');
const router = express.Router();
const { getEmployees, verifyEmployee, updateEmployeeSections } = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/employees', authenticate, requireRole(['Super Admin', 'Admin']), getEmployees);
router.put('/employees/:id/verify', authenticate, requireRole(['Super Admin', 'Admin']), verifyEmployee);
router.put('/employees/:id/sections', authenticate, requireRole(['Super Admin', 'Admin']), updateEmployeeSections);

module.exports = router;
