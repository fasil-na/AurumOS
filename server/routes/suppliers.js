import express from 'express';
import { createSupplier, getSuppliers, deleteSupplier } from '../controllers/supplierController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['Admin', 'Super Admin']));

router.post('/', createSupplier);
router.get('/', getSuppliers);
router.delete('/:id', deleteSupplier);

export default router;
