import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { db } from "@/db/client.js";
import { titles } from "@/db/schema/index.js";

// solo Drizzle

type TitleFilters = {
	q?: string | undefined;
	kind?: (typeof titles.$inferSelect)["kind"] | undefined;
	releasedFrom?: string | undefined;
	releasedTo?: string | undefined;
	includeNonCanon: boolean;
};

type TitleSort =
	"title" | "-title" | "releaseDate" | "-releaseDate" | "createdAt" | "-createdAt";

// lista blanca: del texto que manda el cliente a la columna real
const sortColumns = {
	title: titles.title,
	releaseDate: titles.releaseDate,
	createdAt: titles.createdAt,
};

const buildWhere = (f: TitleFilters) =>
	and(
		f.q ? ilike(titles.title, `%${f.q}%`) : undefined,
		f.kind ? eq(titles.kind, f.kind) : undefined,
		f.releasedFrom ? gte(titles.releaseDate, f.releasedFrom) : undefined,
		f.releasedTo ? lte(titles.releaseDate, f.releasedTo) : undefined,
		f.includeNonCanon ? undefined : eq(titles.isCanon, true),
	);

export const titlesRepository = {
	findAll(f: TitleFilters, sort: TitleSort, page: number, limit: number) {
		const isDescending = sort.startsWith("-");
		const column =
			sortColumns[
				(isDescending ? sort.slice(1) : sort) as keyof typeof sortColumns
			];

		return (
			db
				.select()
				.from(titles)
				.where(buildWhere(f))
				// el id desempata: sin un orden total, una obra puede repetirse o saltearse entre páginas
				.orderBy(isDescending ? desc(column) : asc(column), asc(titles.id))
				.limit(limit)
				.offset((page - 1) * limit)
		);
	},

	count(f: TitleFilters) {
		return db.$count(titles, buildWhere(f));
	},

	async findById(id: number) {
		const [row] = await db.select().from(titles).where(eq(titles.id, id)).limit(1);
		return row;
	},
};
