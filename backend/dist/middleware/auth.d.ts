import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
interface AuthRequest extends Request {
    user?: IUser;
}
declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => any;
declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export { protect, authorize, optionalAuth, AuthRequest };
//# sourceMappingURL=auth.d.ts.map