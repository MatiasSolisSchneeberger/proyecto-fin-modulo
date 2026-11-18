import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@/api/errors/app-error.js";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
	next(
		new NotFoundError(
			"ROUTE_NOT_FOUND",
			`No existe ${req.method} ${req.originalUrl}`,
		),
	);
};
