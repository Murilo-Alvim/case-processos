import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncRoute } from "../lib/async";

const router = Router();

const responsibleSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().nullable(),
  role: z.string().max(120).optional().nullable(),
  team: z.string().max(120).optional().nullable(),
});

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const items = await prisma.responsible.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { processes: true } } },
    });
    res.json(items);
  })
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const data = responsibleSchema.parse(req.body);
    const r = await prisma.responsible.create({ data });
    res.status(201).json(r);
  })
);

router.put(
  "/:id",
  asyncRoute(async (req, res) => {
    const data = responsibleSchema.partial().parse(req.body);
    const r = await prisma.responsible.update({ where: { id: req.params.id }, data });
    res.json(r);
  })
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    await prisma.responsible.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

export default router;
