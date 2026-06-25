import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, User } from './db';

// JWT-like stateless session signing key
const JWT_SECRET = process.env.JWT_SECRET || 'sms_enterprise_portal_secret_key_2026';

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    role: 'Admin' | 'Staff' | 'Viewer';
    fullName: string;
  };
}

/**
 * Hash password securely using Node.js native crypto pbkdf2 algorithm
 */
export function hashPassword(password: string): string {
  // Simple PBKDF2 hash using static salt for consistency with seed database passwords
  const salt = 'sms_enterprise_salt_2026';
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256');
  return hash.toString('hex');
}

/**
 * Sign a session token (custom JWT-like implementation with HMAC signature)
 */
export function signToken(payload: { id: number; email: string; role: string; fullName: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  // Expiry set to 24 hours from now
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${body}.${signature}`;
}

/**
 * Verify session token and return user details if valid
 */
export function verifyToken(token: string): { id: number; email: string; role: 'Admin' | 'Staff' | 'Viewer'; fullName: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(`${header}.${body}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    
    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to authenticate routes
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }
  
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Session expired or token is invalid.' });
  }
  
  // Verify user is still active in DB
  const dbUser = db.getUserById(user.id);
  if (!dbUser || !dbUser.isActive) {
    return res.status(403).json({ message: 'User account is suspended or inactive.' });
  }
  
  req.user = {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username,
    role: dbUser.role,
    fullName: dbUser.fullName,
  };
  
  next();
}

/**
 * Express middleware to enforce Role-Based Access Control
 */
export function requireRole(allowedRoles: ('Admin' | 'Staff' | 'Viewer')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User must be authenticated.' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to perform this action.' });
    }
    
    next();
  };
}
