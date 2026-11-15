import { z } from "zod";
import { titleEditions } from "../schema/index.js";
import { getId, parseCsv } from "./csv.js";
import type { Tx } from "./types.js";

const editionRowSchema = z.object({
	_titles_slug: z.string(),
	slug: z.string(),
	name: z.string(),
	release_date: z.iso.date(),
});

/**
 * Inserta `title_editions` (re-releases, cuts alternativos). Depende de `titles`.
 *
 * El slug de una edición solo es único DENTRO de su obra ("re-release" se repite en varias),
 * por eso la clave del Map es compuesta: `"avengers-endgame|re-release"`.
 *
 * @param titleIds - Map `slug → id` que devuelve `seedTitles`.
 * @returns Map `"<titleSlug>|<editionSlug>" → id`, lo usa `timeline_items`.
 */
export async function seedTitleEditions(tx: Tx, titleIds: Map<string, number>) {
	const rows = parseCsv("title_editions.csv", editionRowSchema);

	const inserted = await tx
		.insert(titleEditions)
		.values(
			rows.map((r) => ({
				titleId: getId(titleIds, r._titles_slug, `title_editions.csv ${r.slug}`),
				slug: r.slug,
				name: r.name,
				releaseDate: r.release_date,
			})),
		)
		.returning({ id: titleEditions.id, titleId: titleEditions.titleId, slug: titleEditions.slug });

	// returning devuelve titleId (número) pero la clave usa el slug de la obra → invierto el Map
	const slugById = new Map([...titleIds].map(([slug, id]) => [id, slug]));

	return new Map(inserted.map((e) => [`${slugById.get(e.titleId)}|${e.slug}`, e.id]));
}
