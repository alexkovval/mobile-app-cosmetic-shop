import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";

/**
 * Wrap an async route handler so thrown/rejected errors reach the error
 * middleware instead of crashing the process or hanging the request.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Must be registered LAST in app.ts (after all routes) — Express identifies
// error middleware by its 4-argument signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
  });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
  });
}
