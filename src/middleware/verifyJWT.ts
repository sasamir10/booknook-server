import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

const jwks = createRemoteJWKSet(new URL("/api/auth/jwks", env.BETTER_AUTH_URL));

export async function verifyJWT(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authorization = req.header("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return next(new AppError("Authentication is required.", 401));

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: env.BETTER_AUTH_URL,
      audience: env.BETTER_AUTH_URL,
      algorithms: ["EdDSA", "ES256", "RS256", "PS256", "ES512"],
    });
    if (typeof payload.sub !== "string" || !payload.sub) {
      return next(new AppError("The authentication token does not identify a user.", 401));
    }
    req.authUser = {
      userId: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "Reader",
      email: typeof payload.email === "string" ? payload.email : "",
    };
    next();
  } catch {
    next(new AppError("Your session has expired or is invalid. Please sign in again.", 401));
  }
}

export function verifyJWTWhenMine(req: Request, res: Response, next: NextFunction): void {
  if (req.query.mine === "true") {
    void verifyJWT(req, res, next);
    return;
  }
  next();
}
