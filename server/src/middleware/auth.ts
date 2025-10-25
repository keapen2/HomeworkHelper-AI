import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { verifyFirebaseToken } from '../config/firebase';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
  firebaseUser?: any;
}

// JWT Authentication middleware
export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Find user in database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('JWT authentication failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// Firebase Authentication middleware
export const authenticateFirebase = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const idToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!idToken) {
      res.status(401).json({
        success: false,
        message: 'Firebase ID token required',
      });
      return;
    }

    const decodedToken = await verifyFirebaseToken(idToken);
    
    // Find or create user in database
    let user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email: decodedToken.email,
        password: 'firebase-user', // Placeholder, will be handled by Firebase
        role: 'student',
      });
      await user.save();
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    logger.error('Firebase authentication failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Firebase token',
    });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
