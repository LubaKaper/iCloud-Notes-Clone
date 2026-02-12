import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
