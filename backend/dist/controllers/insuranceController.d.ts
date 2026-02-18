import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const searchInsuranceProviders: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getAllInsuranceProviders: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getInsuranceProvider: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const createInsuranceProvider: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const updateInsuranceProvider: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=insuranceController.d.ts.map