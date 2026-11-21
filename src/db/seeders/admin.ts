import bcrypt from "bcrypt";
import { env } from "../../config/env.js";
import { users } from "../schema/index.js";
import type { Tx } from "./types.js";

/**
 * Crea el usuario admin a partir de ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD del .env.
 * `users` no se trunca en el seed, así que si ya existe no se pisa ni se duplica.
 * @returns cantidad de admins creados (0 = ya existía o faltan las variables).
 */
export async function seedAdmin(tx: Tx) {
	const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env;

	if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
		console.warn("⚠️  Faltan ADMIN_* en el .env: no se crea el admin");
		return 0;
	}

	const rows = await tx
		.insert(users)
		.values({
			username: ADMIN_USERNAME,
			email: ADMIN_EMAIL.toLowerCase(),
			password: await bcrypt.hash(ADMIN_PASSWORD, 10),
			role: "admin",
		})
		.onConflictDoNothing()
		.returning({ id: users.id });

	return rows.length;
}
