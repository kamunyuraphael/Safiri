import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { HttpError } from "../utils/httpError";

export interface AppError extends Error {
  statusCode?: number;
  code?: string | number;
}

const isProd = () => process.env.NODE_ENV === "production";

export function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  let status = 500;
  let message = "Something went wrong on our side. Please try again.";
  let code: string | undefined;
  let details: unknown;

  if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    // First issue doubles as a readable top-level message for forms.
    const first = err.issues[0];
    message = first ? (first.path.length ? `${first.path.join(".")}: ${first.message}` : first.message) : "Invalid request";
  } else if (err instanceof HttpError) {
    status = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = Object.values(err.errors)[0]?.message || "Invalid data";
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = "INVALID_ID";
    message = `Invalid ${err.path || "value"}`;
  } else if ((err as AppError).code === 11000) {
    status = 409;
    code = "DUPLICATE";
    message = "That record already exists";
  } else if (err instanceof multer.MulterError) {
    status = 400;
    code = "UPLOAD_ERROR";
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5MB or smaller"
        : err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT"
        ? "You can upload up to 5 images"
        : err.message;
  } else if (err.message === "Only image files are allowed") {
    status = 400;
    code = "UPLOAD_ERROR";
    message = err.message;
  } else if (err.name === "SyntaxError" && (err as AppError).statusCode === 400) {
    status = 400;
    message = "Malformed JSON in request body";
  } else if (err.statusCode && err.statusCode < 500) {
    status = err.statusCode;
    message = err.message;
  }

  if (status >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl} -`, err.stack || err.message);
  }

  res.status(status).json({
    message,
    ...(code && { code }),
    ...(details ? { details } : {}),
    ...(!isProd() && status >= 500 && { stack: err.stack }),
  });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}`, code: "NOT_FOUND" });
}
