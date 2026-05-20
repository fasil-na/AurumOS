const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Role not found, authorization denied' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `User role ${req.user.role} is not authorized to access this route` });
    }
    
    next();
  };
};

module.exports = { authorizeRoles };
