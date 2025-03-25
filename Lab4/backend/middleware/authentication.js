import jwt from 'jsonwebtoken';
// Assuming errors are defined elsewhere, we'll import them properly
// If errors module doesn't exist, we'll create custom error classes
const UnauthenticatedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthenticatedError';
    this.statusCode = 401;
  }
};

const ForbiddenError = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
};

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this route');
    }
    next();
  };
};

export { authenticateUser, authorizeRoles };
export default authenticateUser;
