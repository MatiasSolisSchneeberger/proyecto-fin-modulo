import { Router } from "express";
import { titlesController } from "./controller.js";

export const titlesRouter = Router();

titlesRouter.get("/", titlesController.list);
titlesRouter.get("/:id", titlesController.getById);
