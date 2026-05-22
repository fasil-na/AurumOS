import express from 'express';
const router = express.Router();
import rateLimit from 'express-rate-limit';
import { login, logout, me, forgotPassword, resetPassword, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateRequest, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, upload.single('profilePic'), updateProfile);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default router;
