import { RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./tokens.js";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export const authRoutes = Router();

authRoutes.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        role: input.role as RoleName
      }
    });

    const authUser = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    return res.status(201).json({
      user: authUser,
      accessToken,
      refreshToken
    });
  } catch (error) {
    return next(error);
  }
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const authUser = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    return res.json({
      user: authUser,
      accessToken,
      refreshToken
    });
  } catch (error) {
    return next(error);
  }
});

authRoutes.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    return res.json({ accessToken });
  } catch (error) {
    return next(error);
  }
});
