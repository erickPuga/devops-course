import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils.js';
import { JwtPayload } from 'jsonwebtoken';

// Extender Express Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    const payload = verifyToken(token) as JwtPayload | null;

    if (!payload || payload.type !== 'access') {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Error al validar token' });
  }
};
