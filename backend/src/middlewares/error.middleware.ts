import { ErrorRequestHandler } from 'express';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message, errorCode: error.errorCode });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Internal server error', errorCode: ErrorCode.INTERNAL_ERROR });
};

