const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, logout, me, forgotPassword, resetPassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateRequest, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validations/auth.validation');

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

module.exports = router;
