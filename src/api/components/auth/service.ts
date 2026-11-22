import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "@/config/env.js";
import { ConfictError, UnauthorizadeError } from "@/api/errors/app-error.js";
import { authRepository } from "./repository.js";
import type { LoginBody, RegisterBody } from "./schema.js";

const SALT_ROUNDS = 10;

export const authService = {
	async register(body: RegisterBody) {
		if (await authRepository.findByEmail(body.email)) {
			throw new ConfictError("EMAIL_TAKEN", "El email ya está registrado");
		}
		if (await authRepository.findByUsername(body.username)) {
			throw new ConfictError("USERNAME_TAKEN", "El username ya está en uso");
		}

		const password = await bcrypt.hash(body.password, SALT_ROUNDS);
		const user = await authRepository.create({ ...body, password });

		// el DTO NUNCA incluye password
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		};
	},

	async login(body: LoginBody) {
		const user = await authRepository.findByEmail(body.email);
		const isValid = user && (await bcrypt.compare(body.password, user.password));

		if (!user || !isValid) {
			// mismo error para "no existe" y "clave mala": no revelar cuál fue
			throw new UnauthorizadeError("INVALID_CREDENTIALS", "Credenciales inválidas");
		}

		const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
			expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
		});

		return { token };
	},
};
