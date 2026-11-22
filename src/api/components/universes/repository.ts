import { db } from "@/db/client.js";
import { universes } from "@/db/schema/index.js";
import { asc, eq, ilike, or } from "drizzle-orm";

// solo Drizzle

export const universesRepository = {
	findAll(filters: { q?: string | undefined }) {
		const { q } = filters;

		return db
			.select()
			.from(universes)
			.where(
				q
					? or(ilike(universes.name, `%${q}%`), ilike(universes.code, `%${q}%`))
					: undefined, // si es undefinde es un "sin filtro"
			)
			.orderBy(asc(universes.id));
	},

	async findByCode(code: string) {
		const [row] = await db
			.select()
			.from(universes)
			.where(eq(universes.code, code))
			.limit(1);

		return row;
	},
};
