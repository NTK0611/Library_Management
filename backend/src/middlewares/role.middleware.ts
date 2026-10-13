import { NextFunction, Request, Response } from 'express';
import { Role } from '../common/constants/role.constant';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code';

export const requireRole = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, ErrorCode.FORBIDDEN, 'Insufficient permissions'));
      return;
    }
    next();
  };

