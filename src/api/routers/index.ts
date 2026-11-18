import { Router } from "express";
import { healthRouter } from "@/api/components/health/routes.js";
import { universesRouter } from "@/api/components/universes/routes.js";

export const v1Router = Router();
v1Router.use("/health", healthRouter);
v1Router.use("/universes", universesRouter);
