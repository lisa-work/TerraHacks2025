import { Request, Response, NextFunction } from 'express';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: error.message
  });
};

export { notFoundHandler };