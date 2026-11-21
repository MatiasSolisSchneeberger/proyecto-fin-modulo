import type { NextFunction, Request, Response } from "express";
import { loginBody, registerBody } from "./schema.js";
import { authService } from "./service.js";

export const authController = {
	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const body = registerBody.parse(req.body);
			const data = await authService.register(body);

			res.status(201).json({ data });
		} catch (err) {
			next(err);
		}
	},

	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const body = loginBody.parse(req.body);
			const data = await authService.login(body);

			res.status(200).json({ data });
		} catch (err) {
			next(err);
		}
	},
};
