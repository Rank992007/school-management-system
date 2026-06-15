const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

const authorizeOwnerOrRoles = (...roles) => (paramName) => (req, res, next) => {
  const resourceOwnerId = parseInt(req.params[paramName]);
  if (roles.includes(req.user.role) || req.user.userId === resourceOwnerId) {
    return next();
  }
  return res.status(403).json({ message: 'Unauthorized' });
};

module.exports = { authorize, authorizeOwnerOrRoles };
