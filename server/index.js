import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createDataStore } from "./lib/data-store.js";

const PORT = Number(process.env.PORT ?? 4000);

async function bootstrap() {
  const store = await createDataStore();
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/summary", async (req, res, next) => {
    try {
      const summary = await store.getSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/primary-users", async (req, res, next) => {
    try {
      const includeSubUsers = req.query.includeSubUsers === "true";
      const users = await store.listPrimaryUsers(includeSubUsers);
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/primary-users", async (req, res, next) => {
    try {
      const created = await store.createPrimaryUser(req.body ?? {});
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/primary-users/:id", async (req, res, next) => {
    try {
      const includeSubUsers = req.query.includeSubUsers === "true";
      const primary = await store.getPrimaryUser(req.params.id, includeSubUsers);
      if (!primary) {
        res.status(404).json({ message: "Primary user not found" });
        return;
      }
      res.json(primary);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/primary-users/:id", async (req, res, next) => {
    try {
      const updated = await store.updatePrimaryUser(req.params.id, req.body ?? {});
      if (!updated) {
        res.status(404).json({ message: "Primary user not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/primary-users/:id/sub-users", async (req, res, next) => {
    try {
      const created = await store.createSubUser(req.params.id, req.body ?? {});
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/primary-users/:id/sub-users", async (req, res, next) => {
    try {
      const subUsers = await store.listSubUsers(req.params.id);
      res.json(subUsers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sub-users/:id", async (req, res, next) => {
    try {
      const sub = await store.getSubUser(req.params.id);
      if (!sub) {
        res.status(404).json({ message: "Sub user not found" });
        return;
      }
      res.json(sub);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/sub-users/:id", async (req, res, next) => {
    try {
      const updated = await store.updateSubUser(req.params.id, req.body ?? {});
      if (!updated) {
        res.status(404).json({ message: "Sub user not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status ?? 500;
    res.status(status).json({ message: err.message ?? "Unexpected error" });
  });

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend server", error);
  process.exitCode = 1;
});
