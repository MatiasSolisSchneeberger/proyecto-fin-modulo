import type { NextFunction, Request, Response } from "express";
import {
	createTitleBody,
	listTitlesQuery,
	titleParams,
	updateTitleBody,
} from "./schema.js";
import { titlesService } from "./service.js";

// traducir de HTTP a service

export const titlesController = {
	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const query = listTitlesQuery.parse(req.query);
			const result = await titlesService.list(query); // ya viene como { data, meta }

			res.status(200).json(result);
		} catch (err) {
			next(err);
		}
	},

	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const params = titleParams.parse(req.params);
			const data = await titlesService.getById(params.id);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const body = createTitleBody.parse(req.body);
			const data = await titlesService.create(body);

			res.status(201).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const params = titleParams.parse(req.params);
			const body = updateTitleBody.parse(req.body);
			const data = await titlesService.update(params.id, body);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async remove(req: Request, res: Response, next: NextFunction) {
		try {
			const params = titleParams.parse(req.params);
			await titlesService.remove(params.id);

			res.status(204).send(); // sin body
		} catch (err) {
			next(err);
		}
	},
};
