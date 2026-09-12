import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../utils/jwt";
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map