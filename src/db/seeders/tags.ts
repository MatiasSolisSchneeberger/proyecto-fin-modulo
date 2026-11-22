import { z } from "zod";
import { tags } from "../schema/index.js";
import { getId, parseCsv } from "./csv.js";
import type { Tx } from "./types.js";

const tagRowSchema = z.object({
	_tag_categories_name: z.string(), // clave natural de la categoría → resuelve category_id
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

/**
 * Inserta `tags`. Depende de `tag_categories`.
 *
 * @param tagCategoryIds - Map `name → id` que devuelve `seedTagCategories`.
 * @returns Map `slug → id`, lo usa `title_tags` para resolver su FK.
 */
export async function seedTags(tx: Tx, tagCategoryIds: Map<string, number>) {
	const rows = parseCsv("tags.csv", tagRowSchema);

	const inserted = await tx
		.insert(tags)
		.values(
			rows.map((r) => ({
				categoryId: getId(tagCategoryIds, r._tag_categories_name, `tags.csv ${r.slug}`),
				slug: r.slug,
				name: r.name,
				description: r.description,
			})),
		)
		.returning({ id: tags.id, slug: tags.slug });

	return new Map(inserted.map((t) => [t.slug, t.id]));
}
