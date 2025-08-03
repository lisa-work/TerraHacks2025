import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMedicalHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const updateMedicalHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const addAllergy: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const removeAllergy: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const addMedication: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const updateMedication: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const removeMedication: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const addCondition: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const updateCondition: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const removeCondition: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=medicalHistoryController.d.ts.map