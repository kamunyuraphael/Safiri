import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type Source = "body" | "query";

/**
 * Validates and replaces req.body (or a parsed copy of req.query) with the
 * schema's output. Unknown fields are stripped, which is what stops clients
 * from smuggling in fields like `user`, `role` or `images`.
 */
export function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);

    if (source === "body") {
      req.body = result.data;
    } else {
      // Express 5 makes req.query read-only, so parsed values live here.
      (req as Request & { validatedQuery?: unknown }).validatedQuery = result.data;
    }
    next();
  };
}
