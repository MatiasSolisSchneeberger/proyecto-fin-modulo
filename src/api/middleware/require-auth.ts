import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { UnauthorizadeError } from "../errors/app-error.js";
import { env } from "@/config/env.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
	const header = req.headers.authorization;
	const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

	if (!token) {
		return next(new UnauthorizadeError("MISSING_TOKEN", "Falta el token"));
	}

	try {
		const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

		req.user = { id: payload.sub as string, role: payload.role };

		next();
	} catch {
		next(new UnauthorizadeError("INVALID_TOKEN", "Token inválido o expirado"));
	}
};
