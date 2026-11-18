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

	console.error(err); // el detalle va al log, NUNCA a la respuesta

	return send(res, 500, "INTERNAL_ERROR", "Error interno del servidor");
};
