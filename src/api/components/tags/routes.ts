import { Router } from "express";
import { tagController } from "./controller.js";

export const tagsRouter = Router();

tagsRouter.get("/", tagController.list);
tagsRouter.get("/:slug", tagController.getBySlug);
