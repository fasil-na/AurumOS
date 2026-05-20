const bcrypt = require('bcryptjs');
const { generateAuthToken, generateRandomToken } = require('../utils/tokens');
const { sendEmail } = require('../utils/email');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Super Admin Check
    if (
      email === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const token = generateAuthToken('superadmin', 'Super Admin');
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
      return res.json({
        user: { id: 'superadmin', email, role: 'Super Admin', name: 'Super Admin' },
        token
      });
    }

    // Regular User Check
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateAuthToken(user._id, user.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ success: true, message: 'User logged out successfully' });
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If the email exists, a reset link will be sent.' });
    }

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password.</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    });

    res.json({ message: 'If the email exists, a reset link will be sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error processing forgot password request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const resetToken = await PasswordResetToken.findOne({
      token,
      usedAt: null,
      expiresAt: { $gt: Date.now() }
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    resetToken.usedAt = new Date();
    await resetToken.save();

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
};

module.exports = {
  login,
  logout,
  me,
  forgotPassword,
  resetPassword
};
