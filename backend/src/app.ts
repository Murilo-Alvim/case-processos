import express from "express";
import cors from "cors";
import morgan from "morgan";
import areasRouter from "./routes/areas";
import processesRouter from "./routes/processes";
import toolsRouter from "./routes/tools";
import responsiblesRouter from "./routes/responsibles";
import statsRouter from "./routes/stats";
import { errorHandler, notFound } from "./lib/errors";

export function buildApp() {
  const app = express();

  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowed.length === 0 ? true : allowed,
      credentials: false,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));

  app.get("/health", (_req, res) =>
    res.json({ status: "ok", service: "case-processos-api", time: new Date().toISOString() })
  );

  app.use("/api/areas", areasRouter);
  app.use("/api/processes", processesRouter);
  app.use("/api/tools", toolsRouter);
  app.use("/api/responsibles", responsiblesRouter);
  app.use("/api/stats", statsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
