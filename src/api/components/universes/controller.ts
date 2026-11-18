import type { NextFunction, Request, Response } from "express";
import { listaUniversesQuery, universeParams } from "./schema.js";
import { universesService } from "./service.js";

// traducir de HTTP a service

export const universeController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const query = listaUniversesQuery.parse(req.query); // lanza ZodError si está mal
			const data = await universesService.list(query);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async getByCode(req: Request, res: Response, next: NextFunction) {
		try {
			const params = universeParams.parse(req.params);
			const data = await universesService.getByCode(params.code);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},
};
