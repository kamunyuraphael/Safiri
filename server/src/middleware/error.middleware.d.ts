import { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
}
export declare function errorMiddleware(err: AppError, req: Request, res: Response, next: NextFunction): void;
export declare function notFoundMiddleware(req: Request, res: Response): void;
//# sourceMappingURL=error.middleware.d.ts.map