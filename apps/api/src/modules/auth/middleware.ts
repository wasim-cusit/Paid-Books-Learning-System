import type { RoleName } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "./tokens.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.replace("Bearer ", "").trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

export function requireRole(roles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden for this role" });
    }
    return next();
  };
}
