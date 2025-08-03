import { Request, Response, NextFunction } from 'express';
export declare const searchClinics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getClinic: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getClinicAvailability: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getNearbyClinicsByLocation: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const getSpecialties: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getInsuranceProviders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=clinicController.d.ts.map