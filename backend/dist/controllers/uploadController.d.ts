import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadImage: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const getUserImages: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const deleteImage: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const analyzeImageWithAI: (idOrReq: string | AuthRequest, resOrRes?: Response, nextOrNext?: NextFunction, returnResponse?: boolean) => Promise<any>;
export declare const getImageAnalysis: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=uploadController.d.ts.map