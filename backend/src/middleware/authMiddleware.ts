import { Request, Response, NextFunction } from 'express';

// JWT auth middleware — to be implemented
export const protect = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
