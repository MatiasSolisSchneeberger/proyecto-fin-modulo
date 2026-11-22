import { Router } from "express";
import { studioController } from "./controller.js";

export const studioRouter = Router();

studioRouter.get("/", studioController.list);
studioRouter.get("/:id", studioController.getById);
