import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code';

export const validate = (schema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(400, ErrorCode.VALIDATION_ERROR, result.error.issues.map((issue) => issue.message).join(', ')));
      return;
    }
    req.body = result.data;
    next();
  };

