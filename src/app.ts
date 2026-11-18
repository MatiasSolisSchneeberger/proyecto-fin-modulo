import express from "express";
import { v1Router } from "@/api/routers/index.js";
import { notFoundHandler } from "@/api/middleware/not-found.js";
import { errorHandler } from "@/api/middleware/error-handler.js";

export const app = express();

app.use(express.json({ limit: "100kb" }));
app.use("/api/v1", v1Router);
app.use(notFoundHandler); // después de las rutas: solo corre si nadie respondió

app.use(errorHandler); // SIEMPRE último
