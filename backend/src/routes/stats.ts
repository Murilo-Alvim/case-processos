import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncRoute } from "../lib/async";

const router = Router();

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const [areas, processes, tools, responsibles, docs, byType, byStatus, byPriority] =
      await Promise.all([
        prisma.area.count(),
        prisma.process.count(),
        prisma.tool.count(),
        prisma.responsible.count(),
        prisma.document.count(),
        prisma.process.groupBy({ by: ["type"], _count: { _all: true } }),
        prisma.process.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.process.groupBy({ by: ["priority"], _count: { _all: true } }),
      ]);

    const areasDetail = await prisma.area.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { processes: true } } },
    });

    res.json({
      totals: { areas, processes, tools, responsibles, documents: docs },
      byType: Object.fromEntries(byType.map((b) => [b.type, b._count._all])),
      byStatus: Object.fromEntries(byStatus.map((b) => [b.status, b._count._all])),
      byPriority: Object.fromEntries(byPriority.map((b) => [b.priority, b._count._all])),
      byArea: areasDetail.map((a) => ({
        id: a.id,
        name: a.name,
        color: a.color,
        icon: a.icon,
        total: a._count.processes,
      })),
    });
  })
);

export default router;
