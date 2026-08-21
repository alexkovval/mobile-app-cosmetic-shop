import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../lib/errors";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export interface AuthedRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  sub: string;
}

/**
 * Verifies the Bearer JWT and attaches `req.userId`. Every route under
 * /cart and /orders, plus GET /auth/me, sits behind this.
 */
export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or malformed Authorization header"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.sub;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function signToken(userId: string): string {
  // 7-day expiry: an accepted MVP shortcut (no refresh-token rotation) —
  // documented in ARCHITECTURE_PLAN.md §1 and the README's technical-decisions section.
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}
