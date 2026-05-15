import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;

  const isProduction = config.nodeEnv === 'production';
  const message = statusCode === 500 && isProduction
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode}: ${err.message}`, isProduction ? '' : err.stack);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
