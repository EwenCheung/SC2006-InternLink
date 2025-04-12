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
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthenticatedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    console.log('Processing token:', token.substring(0, 20) + '...');

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT Payload:', {
      userId: payload.userId,
      role: payload.role
    });

    if (!payload.userId || !payload.role) {
      throw new UnauthenticatedError('Invalid token payload');
    }

    req.user = {
      userId: payload.userId,
      role: payload.role
    };

    console.log('Authenticated user:', {
      userId: req.user.userId,
      role: req.user.role,
      path: req.path
    });
    
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
