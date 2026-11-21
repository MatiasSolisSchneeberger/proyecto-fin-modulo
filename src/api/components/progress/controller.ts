import type { NextFunction, Request, Response } from "express";
import { UnauthorizadeError } from "@/api/errors/app-error.js";
import { listProgressQuery, progressParams, upsertProgressBody } from "./schema.js";
import { progressService } from "./service.js";

// traducir de HTTP a service

// el usuario sale SIEMPRE del token (requireAuth lo deja en req.user), nunca de la URL ni del body
const getUserId = (req: Request) => {
	if (!req.user) {
		throw new UnauthorizadeError("MISSING_TOKEN", "Falta el token de autenticación");
	}

	return req.user.id;
};

export const progressController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = getUserId(req);
			const query = listProgressQuery.parse(req.query);
			const result = await progressService.list(userId, query); // ya viene como { data, meta }

			res.status(200).json(result);
		} catch (err) {
			next(err);
		}
	},

	async upsert(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = getUserId(req);
			const params = progressParams.parse(req.params);
			// Express 5: req.body es undefined si no mandan body → se trata como {}
			const body = upsertProgressBody.parse(req.body ?? {});
			const data = await progressService.upsert(userId, params.itemId, body);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async remove(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = getUserId(req);
			const params = progressParams.parse(req.params);
			await progressService.remove(userId, params.itemId);

			res.status(204).send(); // sin body
		} catch (err) {
			next(err);
		}
	},
};
