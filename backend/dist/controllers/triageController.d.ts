import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const startTriageSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTriageSession: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const submitTriageFeedback: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getTriageHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=triageController.d.ts.map