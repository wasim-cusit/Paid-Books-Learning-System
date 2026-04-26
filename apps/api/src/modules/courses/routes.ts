import { RoleName } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

export const courseRoutes = Router();

courseRoutes.get("/", async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

courseRoutes.post("/", requireAuth, requireRole([RoleName.TEACHER, RoleName.SUPER_ADMIN]), async (req, res, next) => {
  try {
    const input = z
      .object({
        title: z.string().min(3),
        description: z.string().min(10),
        price: z.number().positive(),
        teacherId: z.string().min(3),
        isPublished: z.boolean().default(false)
      })
      .parse(req.body);

    const course = await prisma.course.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        teacherId: input.teacherId,
        isPublished: input.isPublished
      }
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
});
