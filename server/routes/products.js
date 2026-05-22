import express from 'express';
import { createProduct, getProducts, updateProduct } from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.post('/', upload.array('images', 5), createProduct);
router.get('/', getProducts);
router.put('/:id', upload.array('images', 5), updateProduct);

export default router;
