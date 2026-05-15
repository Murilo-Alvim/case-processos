import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncRoute } from "../lib/async";

const router = Router();

const toolSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(["software", "platform", "service"]).optional(),
  url: z.string().url().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const items = await prisma.tool.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { processes: true } } },
    });
    res.json(items);
  })
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const data = toolSchema.parse(req.body);
    const tool = await prisma.tool.create({ data });
    res.status(201).json(tool);
  })
);

router.put(
  "/:id",
  asyncRoute(async (req, res) => {
    const data = toolSchema.partial().parse(req.body);
    const tool = await prisma.tool.update({ where: { id: req.params.id }, data });
    res.json(tool);
  })
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    await prisma.tool.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

export default router;
