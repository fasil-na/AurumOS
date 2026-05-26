import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getDependencies, updateAssignmentStatus } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/dependencies', getDependencies);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:taskId/products/:productId/assignments/:assignmentId', updateAssignmentStatus);

export default router;
