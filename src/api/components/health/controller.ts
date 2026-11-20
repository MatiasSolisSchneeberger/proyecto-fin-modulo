import type { NextFunction, Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "@/db/client.js";
import { AppError } from "@/api/errors/app-error.js";

export const healthController = {
	async check(_req: Request, res: Response, next: NextFunction) {
		try {
			await db.execute(sql`select 1`);

			res.status(200).json({
				data: { status: "ok", db: "ok", uptime: Math.round(process.uptime()) },
			});
		} catch (err) {
			console.error(err);
			next(new AppError(503, "DB_UNAVAILABLE", "La base de datos no responde"));
		}
	},
};
