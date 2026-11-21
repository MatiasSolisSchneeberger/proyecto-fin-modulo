import { db } from "@/db/client.js";
import { users } from "@/db/schema/index.js";
import { eq, sql } from "drizzle-orm";

export const authRepository = {
	async findByEmail(email: string) {
		const [row] = await db
			.select()
			.from(users)
			.where(eq(sql`lower(${users.email})`, email))
			.limit(1);
		return row;
	},

	async findByUsername(username: string) {
		const [row] = await db
			.select()
			.from(users)
			.where(eq(users.username, username))
			.limit(1);
		return row;
	},

	async create(data: { username: string; email: string; password: string }) {
		const [row] = await db.insert(users).values(data).returning();

		if (!row) {
			throw new Error("No se pudo crear el usuario");
		}

		return row;
	},
};
