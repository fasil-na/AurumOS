import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createStoneType, getStoneTypes, deleteStoneType } from '../controllers/stoneTypeController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole(['Super Admin', 'Admin']), createStoneType);
router.get('/', getStoneTypes);
router.delete('/:id', requireRole(['Super Admin', 'Admin']), deleteStoneType);

export default router;
