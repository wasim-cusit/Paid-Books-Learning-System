import { Router } from "express";
import { RoleName } from "@prisma/client";
import { requireAuth, requireRole } from "../auth/middleware.js";
import { createCheckoutSession, startPurchase } from "./service.js";

export const paymentRoutes = Router();

paymentRoutes.get("/providers", (_req, res) => {
  res.json({
    providers: ["stripe", "jazzcash", "easypaisa"]
  });
});

paymentRoutes.post("/checkout", async (req, res, next) => {
  try {
    const session = await createCheckoutSession(req.body);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

paymentRoutes.post("/purchase/start", requireAuth, requireRole([RoleName.STUDENT]), async (req, res, next) => {
  try {
    const user = req.user!;
    const result = await startPurchase(user.userId, user.email, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
