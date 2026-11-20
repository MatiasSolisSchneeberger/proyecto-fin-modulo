import { Router } from "express";
import { tagCategoriesController } from "./controller.js";

export const tagCategoriesRouter = Router();

tagCategoriesRouter.get("/", tagCategoriesController.list);
