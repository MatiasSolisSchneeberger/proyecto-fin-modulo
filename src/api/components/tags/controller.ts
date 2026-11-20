import type { NextFunction, Request, Response } from "express";
import { listTagsQuery, tagsParams } from "./schema.js";
import { tagsService } from "./service.js";

// traducir de HTTP a service

export const tagController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const query = listTagsQuery.parse(req.query); // lanza ZodError si está mal
			const data = await tagsService.list(query);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async getBySlug(req: Request, res: Response, next: NextFunction) {
		try {
			const params = tagsParams.parse(req.params);
			const data = await tagsService.getBySlug(params.slug);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},
};
