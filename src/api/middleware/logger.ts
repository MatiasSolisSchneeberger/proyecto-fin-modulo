import type { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const startedAt = process.hrtime.bigint();

	res.on("finish", () => {
		const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
		console.log(
			`${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(elapsedMs)}ms`,
		);
	});

	next();
};
