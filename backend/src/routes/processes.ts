import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncRoute } from "../lib/async";
import { HttpError } from "../lib/errors";

const router = Router();

const processSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(["system", "manual", "hybrid"]).optional(),
  status: z.enum(["active", "draft", "deprecated"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  order: z.number().int().optional(),
  areaId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  toolIds: z.array(z.string().uuid()).optional(),
  responsibleIds: z.array(z.string().uuid()).optional(),
});

// monta árvore recursiva a partir de uma lista plana
type Flat = Awaited<ReturnType<typeof loadProcesses>>[number];
type TreeNode = Flat & { children: TreeNode[] };

async function loadProcesses(areaId?: string) {
  return prisma.process.findMany({
    where: areaId ? { areaId } : undefined,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      area: true,
      tools: { include: { tool: true } },
      responsibles: { include: { responsible: true } },
      documents: true,
      _count: { select: { children: true } },
    },
  });
}

function buildTree(items: Flat[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  for (const p of items) map.set(p.id, { ...p, children: [] });
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// GET /processes?areaId=&tree=true
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const areaId = req.query.areaId as string | undefined;
    const items = await loadProcesses(areaId);
    if (req.query.tree === "true") {
      return res.json(buildTree(items));
    }
    res.json(items);
  })
);

router.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const item = await prisma.process.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        area: true,
        parent: true,
        children: {
          orderBy: { order: "asc" },
          include: { _count: { select: { children: true } } },
        },
        tools: { include: { tool: true } },
        responsibles: { include: { responsible: true } },
        documents: true,
      },
    });
    res.json(item);
  })
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const { toolIds, responsibleIds, parentId, ...rest } = processSchema.parse(req.body);

    if (parentId) {
      const parent = await prisma.process.findUnique({ where: { id: parentId } });
      if (!parent) throw new HttpError(400, "Processo pai inexistente");
      if (parent.areaId !== rest.areaId)
        throw new HttpError(400, "Subprocesso deve estar na mesma área do processo pai");
    }

    const item = await prisma.process.create({
      data: {
        ...rest,
        parentId: parentId ?? null,
        tools: toolIds ? { create: toolIds.map((toolId) => ({ toolId })) } : undefined,
        responsibles: responsibleIds
          ? { create: responsibleIds.map((responsibleId) => ({ responsibleId })) }
          : undefined,
      },
      include: {
        tools: { include: { tool: true } },
        responsibles: { include: { responsible: true } },
        documents: true,
      },
    });
    res.status(201).json(item);
  })
);

router.put(
  "/:id",
  asyncRoute(async (req, res) => {
    const partial = processSchema.partial().parse(req.body);
    const { toolIds, responsibleIds, parentId, ...rest } = partial;

    if (parentId === req.params.id) {
      throw new HttpError(400, "Processo não pode ser pai de si mesmo");
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (toolIds !== undefined) {
        await tx.processTool.deleteMany({ where: { processId: req.params.id } });
        if (toolIds.length) {
          await tx.processTool.createMany({
            data: toolIds.map((toolId) => ({ processId: req.params.id, toolId })),
          });
        }
      }
      if (responsibleIds !== undefined) {
        await tx.processResponsible.deleteMany({ where: { processId: req.params.id } });
        if (responsibleIds.length) {
          await tx.processResponsible.createMany({
            data: responsibleIds.map((responsibleId) => ({
              processId: req.params.id,
              responsibleId,
            })),
          });
        }
      }
      return tx.process.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(parentId !== undefined ? { parentId: parentId ?? null } : {}),
        },
        include: {
          tools: { include: { tool: true } },
          responsibles: { include: { responsible: true } },
          documents: true,
        },
      });
    });

    res.json(updated);
  })
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    await prisma.process.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

// Documentação aninhada num processo
const docSchema = z.object({
  title: z.string().min(2).max(160),
  url: z.string().url().optional().nullable(),
  type: z.enum(["link", "file", "wiki", "video"]).optional(),
  description: z.string().max(500).optional().nullable(),
});

router.post(
  "/:id/documents",
  asyncRoute(async (req, res) => {
    const data = docSchema.parse(req.body);
    const doc = await prisma.document.create({
      data: { ...data, processId: req.params.id },
    });
    res.status(201).json(doc);
  })
);

router.delete(
  "/:id/documents/:docId",
  asyncRoute(async (req, res) => {
    await prisma.document.delete({ where: { id: req.params.docId } });
    res.status(204).end();
  })
);

export default router;
