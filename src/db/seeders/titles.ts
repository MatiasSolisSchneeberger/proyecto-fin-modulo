import { z } from "zod";
import { titleKind, titles } from "@/db/schema/index.js";
import type { Tx } from "./types.js";
import { csvBool, readCsv } from "./csv.js";

const titleRowSchema = z.object({
	kind: z.enum(titleKind.enumValues), // usa los pgENum
	title: z.string(),
	slug: z.string(),
	release_date: z.iso.date(), // para que sea YYYY-mm-dd
	poster_url: z.string().nullable(),
	synopsis: z.string().nullable(),
	is_canon: csvBool, // "true" / "false" → boolean
});

export async function seedTitles(tx: Tx) {
	// leo y valido
	const rows = readCsv("titles.csv").map((raw, i) => {
		const result = titleRowSchema.safeParse(raw);

		if (!result.success) {
			throw new Error(
				`title.csv linea ${i + 2}:\n${z.prettifyError(result.error)}`,
				// i + 2 porque es 1 fila de header y 1 mas porque no comienza en 0 comienza en 1
			);
		}

		return result.data;
	});

	// mapeo las columnas del cvs a columnas de drizzle. de snake_case a camelCase
	const values: (typeof titles.$inferInsert)[] = rows.map((r) => ({
		kind: r.kind,
		title: r.title,
		slug: r.slug,
		releaseDate: r.release_date,
		posterUrl: r.poster_url,
		synopsis: r.synopsis,
		isCanon: r.is_canon,
	}));

	// inserto todo  en un solo insert. y pido la id + slug de vuelta
	const inserted = await tx
		.insert(titles)
		.values(values)
		.returning({ id: titles.id, slug: titles.slug });

	return new Map(inserted.map((t) => [t.slug, t.id]));
}
