import { Request, Response, NextFunction } from 'express';
import { Logger } from '../services/logger';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  Logger.debug(`[authMiddleware] Header: ${authHeader}`);
  if (!token) {
    Logger.warn('[authMiddleware] Token manquant');
    return res.status(401).json({ error: 'Token manquant' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      Logger.warn(`[authMiddleware] Token invalide: ${err.message}`);
      return res.status(403).json({ error: 'Token invalide' });
    }
    Logger.debug('[authMiddleware] Token valide');
    (req as any).user = user;
    next();
  });
}
