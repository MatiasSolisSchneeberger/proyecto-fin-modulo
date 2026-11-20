import { asc, eq, ilike } from "drizzle-orm";
import { db } from "@/db/client.js";
import { platforms } from "@/db/schema/index.js";

// solo Drizzle

export const platformsRepository = {
	findAll(filters: { q?: string | undefined }) {
		const { q } = filters;

		return db
			.select()
			.from(platforms)
			.where(q ? ilike(platforms.name, `%${q}%`) : undefined)
			.orderBy(asc(platforms.id));
	},

	async findById(id: number) {
		const [row] = await db
			.select()
			.from(platforms)
			.where(eq(platforms.id, id))
			.limit(1);

		return row;
	},
};
