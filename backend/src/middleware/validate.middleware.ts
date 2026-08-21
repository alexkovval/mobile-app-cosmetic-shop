import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../lib/errors";

type ValidationTargets = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
};

/**
 * Generic request validator: pass Zod schemas for whichever parts of the
 * request (body/query/params) a route needs validated. On success, the
 * parsed (and coerced/defaulted) values REPLACE req.body/query/params, so
 * downstream handlers can trust their shape and types.
 */
export function validate(targets: ValidationTargets) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (targets.body) {
        req.body = targets.body.parse(req.body);
      }
      if (targets.query) {
        req.query = targets.query.parse(req.query) as unknown as Request["query"];
      }
      if (targets.params) {
        req.params = targets.params.parse(req.params) as unknown as Request["params"];
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ValidationError("Request validation failed", err.flatten()));
      }
      next(err);
    }
  };
}
