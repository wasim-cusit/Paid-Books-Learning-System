import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../types/auth.js";

type JwtPayload = AuthUser & { type: "access" | "refresh" };

export function signAccessToken(user: AuthUser) {
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"];
  return jwt.sign({ ...user, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn
  });
}

export function signRefreshToken(user: AuthUser) {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];
  return jwt.sign({ ...user, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}
