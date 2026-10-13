import { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code';
import { verifyAccessToken } from '../config/jwt.config';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication is required'));
    return;
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(new AppError(401, ErrorCode.UNAUTHORIZED, 'Invalid or expired access token'));
  }
};

