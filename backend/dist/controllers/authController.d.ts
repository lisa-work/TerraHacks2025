import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const resendVerification: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getMe: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=authController.d.ts.map