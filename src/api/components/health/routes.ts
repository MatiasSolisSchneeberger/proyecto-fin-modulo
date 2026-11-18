import { Router } from "express";
import { healthController } from "@/api/components/health/controller.js";

export const healthRouter = Router();
healthRouter.get("/", healthController.check);
