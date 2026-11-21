import { Router } from "express";
import { requireAuth, requireRole } from "@/api/middleware/require-auth.js";
import { titlesController } from "./controller.js";

export const titlesRouter = Router();

// públicas
titlesRouter.get("/", titlesController.list);
titlesRouter.get("/:id", titlesController.getById);

// protegidas: requieren JWT y rol admin (solo el admin escribe en el catálogo).
titlesRouter.post("/", requireAuth, requireRole("admin"), titlesController.create);
titlesRouter.put("/:id", requireAuth, requireRole("admin"), titlesController.update);
titlesRouter.delete("/:id", requireAuth, requireRole("admin"), titlesController.remove);
