import type { NextFunction, Request, Response } from "express";
import { AppError, type ErrorDetail } from "@/api/errors/app-error.js";
import { ZodError } from "zod";

const send = (
	res: Response,
	status: number,
	code: string,
	message: string,
	details?: ErrorDetail[],
) => {
	res.status(status).json({ error: { code, message, ...(details && { details }) } });
};

// Drizzle envuelve el error de pg: el código SQLSTATE puede estar en err.cause
const findPgError = (err: unknown): Record<string, unknown> | null => {
	let current: any = err;
	while (current) {
		if (typeof current.code === "string" && /^[0-9A-Z]{5}$/.test(current.code))
			return current;
		current = current.cause;
	}
	return null;
};

export const errorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof AppError) {
		return send(res, err.statusCode, err.code, err.message, err.details);
	}

	if (err instanceof ZodError) {
		const details = err.issues.map((i) => ({
			field: i.path.map(String).join("."),
			message: i.message,
		}));
		return send(res, 400, "VALIDATION_ERROR", "Hay errores de validación", details);
	}

	if (
		typeof err === "object" &&
		err !== null &&
		(err as any).type === "entity.parse.failed"
	) {
		return send(res, 400, "INVALID_JSON", "El body no es un JSON válido");
	}

	const pg = findPgError(err);

	if (pg) {
		switch (pg.code) {
			case "23505":
				return send(res, 409, "UNIQUE_VIOLATION", "El recurso ya existe");
			case "23503":
				return send(
					res,
					409,
					"FOREIGN_KEY_VIOLATION",
					"Referencia inválida o en uso",
				);
			case "23514":
				return send(
					res,
					400,
					"CHECK_VIOLATION",
					"Un valor no cumple una restricción",
				);
			case "22P02":
				return send(res, 400, "INVALID_FORMAT", "Formato de dato inválido");
		}
	}
	console.error(err); // el detalle va al log, NUNCA a la respuesta

	return send(res, 500, "INTERNAL_ERROR", "Error interno del servidor");
};
