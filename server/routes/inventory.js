import express from 'express';
import { getInventoryStats, addMaterialReceipt } from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('Admin'));

router.get('/', getInventoryStats);
router.post('/', addMaterialReceipt);

export default router;
