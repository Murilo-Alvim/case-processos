import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncRoute } from "../lib/async";

const router = Router();

const areaSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().min(1).max(60).optional(),
});

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const areas = await prisma.area.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { processes: { where: { parentId: null } } },
        },
      },
    });
    res.json(areas);
  })
);

router.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const area = await prisma.area.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        processes: {
          orderBy: { order: "asc" },
          include: {
            children: true,
            tools: { include: { tool: true } },
            responsibles: { include: { responsible: true } },
            documents: true,
          },
        },
      },
    });
    res.json(area);
  })
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const data = areaSchema.parse(req.body);
    const area = await prisma.area.create({ data });
    res.status(201).json(area);
  })
);

router.put(
  "/:id",
  asyncRoute(async (req, res) => {
    const data = areaSchema.partial().parse(req.body);
    const area = await prisma.area.update({
      where: { id: req.params.id },
      data,
    });
    res.json(area);
  })
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    await prisma.area.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

export default router;
