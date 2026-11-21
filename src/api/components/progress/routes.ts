import { Router } from "express";
import { requireAuth } from "@/api/middleware/require-auth.js";
import { progressController } from "./controller.js";

export const progressRouter = Router();

// todas las rutas requieren JWT: cada usuario solo ve y modifica lo suyo
progressRouter.use(requireAuth);

progressRouter.get("/", progressController.list);
progressRouter.put("/:itemId", progressController.upsert);
progressRouter.delete("/:itemId", progressController.remove);
