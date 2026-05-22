import express from 'express';
const router = express.Router();
import { getEmployees, verifyEmployee, updateEmployeeSections } from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

router.get('/employees', authenticate, requireRole(['Super Admin', 'Admin']), getEmployees);
router.put('/employees/:id/verify', authenticate, requireRole(['Super Admin', 'Admin']), verifyEmployee);
router.put('/employees/:id/sections', authenticate, requireRole(['Super Admin', 'Admin']), updateEmployeeSections);

export default router;
