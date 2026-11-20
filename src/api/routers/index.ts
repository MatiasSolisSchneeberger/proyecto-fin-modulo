import { Router } from "express";
import { healthRouter } from "@/api/components/health/routes.js";
import { universesRouter } from "@/api/components/universes/routes.js";
import { titlesRouter } from "@/api/components/titles/routes.js";
import { studioRouter } from "../components/studios/routes.js";
import { platformsRouter } from "@/api/components/platforms/routes.js";
import { tagCategoriesRouter } from "@/api/components/tag-categories/routes.js";
import { tagsRouter } from "../components/tags/routes.js";

export const v1Router = Router();
v1Router.use("/health", healthRouter);
v1Router.use("/universes", universesRouter);
v1Router.use("/titles", titlesRouter);
v1Router.use("/studios", studioRouter);
v1Router.use("/platforms", platformsRouter);
v1Router.use("/tag-categories", tagCategoriesRouter);
v1Router.use("/tags", tagsRouter);
