import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { db } from "@/db/client.js";
import { productionStudios, titles } from "@/db/schema/index.js";

export const studiosRepository = {
	findAll(filters: { q?: string | undefined }) {
		const { q } = filters;

		return db
			.select()
			.from(productionStudios)
			.where(
				q ? ilike(productionStudios.name, `%${q}%`) : undefined, // si es undefinde es un "sin filtro"
			)
			.orderBy(asc(productionStudios.id));
	},

	async findById(id: number) {
		const [row] = await db
			.select()
			.from(productionStudios)
			.where(eq(productionStudios.id, id))
			.limit(1);

		return row;
	},
};
