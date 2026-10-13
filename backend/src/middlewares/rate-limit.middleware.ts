import { NextFunction, Request, Response } from 'express';

const requests = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = (limit = 100, windowMs = 60_000) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const current = requests.get(key);
    const now = Date.now();
    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= limit) {
      res.status(429).json({ message: 'Too many requests', errorCode: 'RATE_LIMITED' });
      return;
    }
    current.count += 1;
    next();
  };

