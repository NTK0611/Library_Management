import { ErrorCode } from './error-code';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

