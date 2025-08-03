import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const deleteAccount: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=userController.d.ts.map