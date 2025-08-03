import { Response } from 'express';
export declare const generateToken: (id: string) => string;
export declare const generateRefreshToken: (id: string) => string;
export declare const sendTokenResponse: (user: any, statusCode: number, res: Response) => void;
export declare const verifyRefreshToken: (token: string) => any;
//# sourceMappingURL=jwt.d.ts.map