import type { NextFunction, Request, Response } from "express";
import { listStudiosQuery, studioParams } from "./schema.js";
import { studiosService } from "./service.js";

// traducir de HTTP a service

export const studioController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const query = listStudiosQuery.parse(req.query);
			const data = await studiosService.list(query);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const params = studioParams.parse(req.params);
			const data = await studiosService.getById(params.id);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},
};
