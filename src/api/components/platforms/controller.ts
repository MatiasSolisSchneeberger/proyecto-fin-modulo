import type { NextFunction, Request, Response } from "express";
import { listPlatformsQuery, platformParams } from "./schema.js";
import { platformsService } from "./service.js";

// traducir de HTTP a service

export const platformsController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const query = listPlatformsQuery.parse(req.query);
			const data = await platformsService.list(query);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const params = platformParams.parse(req.params);
			const data = await platformsService.getById(params.id);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},
};
