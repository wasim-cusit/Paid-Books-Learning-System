import { RoleName } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../auth/middleware.js";

export const progressRoutes = Router();

const querySchema = z.object({
  studentId: z.string().optional()
});

progressRoutes.use(requireAuth);
progressRoutes.use(requireRole([RoleName.TEACHER, RoleName.SUPER_ADMIN]));

progressRoutes.get("/overview", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const where = query.studentId ? { userId: query.studentId } : {};
    const events = await prisma.progressEvent.findMany({
      where,
      include: { user: true, lesson: true },
      orderBy: { createdAt: "desc" },
      take: 500
    });

    const totalStudents = new Set(events.map((event) => event.userId)).size;
    const avgCompletionRate =
      events.length === 0
        ? 0
        : Math.round(events.reduce((sum, event) => sum + event.completionPct, 0) / events.length);
    const atRiskStudents = new Set(events.filter((event) => event.completionPct < 30).map((event) => event.userId)).size;

    res.json({
      summary: {
        totalStudents,
        atRiskStudents,
        avgCompletionRate
      },
      filters: ["course", "teacher", "dateRange", "subscriptionStatus", "riskLevel"],
      recentEvents: events.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
});

progressRoutes.get("/drilldown/:studentId", async (req, res, next) => {
  try {
    const events = await prisma.progressEvent.findMany({
      where: { userId: req.params.studentId },
      include: { lesson: true },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    const courseProgress =
      events.length === 0
        ? 0
        : Math.round(events.reduce((sum, event) => sum + event.completionPct, 0) / events.length);

    res.json({
      studentId: req.params.studentId,
      courseProgress,
      timeline: events
    });
  } catch (error) {
    next(error);
  }
});

progressRoutes.post("/events", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().min(3),
        courseId: z.string().min(3),
        lessonId: z.string().min(3).optional(),
        completionPct: z.number().int().min(0).max(100),
        watchTimeSec: z.number().int().min(0).default(0),
        activeTimeSec: z.number().int().min(0).default(0),
        score: z.number().int().min(0).max(100).optional()
      })
      .parse(req.body);

    const created = await prisma.progressEvent.create({ data: payload });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

progressRoutes.get("/export", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const where = query.studentId ? { userId: query.studentId } : {};
    const events = await prisma.progressEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500
    });

    res.json({
      exportFormat: "json-preview",
      total: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
});
