import { Request, Response, NextFunction } from 'express';
import { Logger } from '../services/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  Logger.error(`[errorHandler] ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Erreur interne du serveur' });
}
