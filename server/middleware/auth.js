const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'Super Admin') {
      req.user = {
        id: 'superadmin',
        email: process.env.SUPER_ADMIN_EMAIL,
        role: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin'
      };
      return next();
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: requires one of the following roles: ${roles.join(', ')}` });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
