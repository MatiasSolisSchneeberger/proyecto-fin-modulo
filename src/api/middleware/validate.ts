import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { BadRequestError, type ErrorDetail } from "@/api/errors/app-error.js";

type Schemas = { body?: ZodType; query?: ZodType; params?: ZodType };

export const validate =
	(schemas: Schemas): RequestHandler =>
	(req, res, next) => {
		const details: ErrorDetail[] = [];
		const validated: Record<string, unknown> = {};

		for (const key of ["params", "query", "body"] as const) {
			const schema = schemas[key];
			if (!schema) continue;
			const result = schema.safeParse(req[key]);
			if (result.success) {
				validated[key] = result.data;
			} else {
				details.push(
					...result.error.issues.map((i) => ({
						field: i.path.map(String).join("."),
						message: i.message,
					})),
				);
			}
		}

		if (details.length > 0) {
			return next(
				new BadRequestError(
					"VALIDATION_ERROR",
					"Hay errores de validación",
					details,
				),
			);
		}

		// Express 4
		// req.query = validate

		// Express 5
		res.locals.validated = validated;
		next();
	};
