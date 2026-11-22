import { Router } from "express";
import { platformsController } from "./controller.js";

export const platformsRouter = Router();

platformsRouter.get("/", platformsController.list);
platformsRouter.get("/:id", platformsController.getById);
