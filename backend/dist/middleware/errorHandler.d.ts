import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: any;
    errors?: any;
}
declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => void;
export { errorHandler };
//# sourceMappingURL=errorHandler.d.ts.map