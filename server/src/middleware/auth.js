import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in to access this resource.',
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'smart_pds_jwt_super_secret_key_change_in_production_2026';
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB to verify user still exists and isActive
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your PDS administrator.',
      });
    }

    // Attach user to req (clean instance without password)
    const userObj = user.toJSON();
    req.user = userObj;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Required role(s): [${roles.join(', ')}]. Your role: ${req.user ? req.user.role : 'Unauthenticated'}`,
      });
    }
    next();
  };
};
