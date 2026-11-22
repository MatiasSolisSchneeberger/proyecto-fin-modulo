import { Router } from "express";
import { universeController } from "./controller.js";

export const universesRouter = Router();

universesRouter.get("/", universeController.list);
universesRouter.get("/:code", universeController.getByCode);
