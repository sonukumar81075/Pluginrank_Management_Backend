import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    plan: 'free' | 'paid';
}
declare global {
    namespace Express {
        interface Request {
            auth?: AuthUser;
            authVia?: 'jwt' | 'api_key';
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map