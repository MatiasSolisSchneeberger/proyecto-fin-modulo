import type { NextFunction, Request, Response } from "express";
import { tagCategoriesService } from "./service.js";

// traducir de HTTP a service

export const tagCategoriesController = {
	async list(_req: Request, res: Response, next: NextFunction) {
		try {
			const data = await tagCategoriesService.list();

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},
};
