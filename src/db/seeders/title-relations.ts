import { z } from "zod";
import { titlePlatforms, titleProductionStudios, titleTags } from "../schema/index.js";
import { csvBool, getId, parseCsv } from "./csv.js";
import type { Tx } from "./types.js";

// Tablas N:M de `titles`. No tienen `id` propio ni nadie las referencia, así que
// no usan `.returning()` ni devuelven un Map: solo resuelven las dos FK e insertan.

const titleTagRowSchema = z.object({
	_titles_slug: z.string(),
	_tags_slug: z.string(),
	is_spoiler: csvBool,
});

/** `title_tags`: etiquetas de cada obra (fase, saga...). Depende de `titles` y `tags`. */
export async function seedTitleTags(
	tx: Tx,
	titleIds: Map<string, number>,
	tagIds: Map<string, number>,
) {
	const rows = parseCsv("title_tags.csv", titleTagRowSchema);

	await tx.insert(titleTags).values(
		rows.map((r) => ({
			titleId: getId(titleIds, r._titles_slug, "title_tags.csv"),
			tagId: getId(tagIds, r._tags_slug, "title_tags.csv"),
			isSpoiler: r.is_spoiler,
		})),
	);

	return rows.length;
}

const titlePlatformRowSchema = z.object({
	_titles_slug: z.string(),
	_platforms_name: z.string(),
});

/** `title_platforms`: dónde se puede ver cada obra. Depende de `titles` y `platforms`. */
export async function seedTitlePlatforms(
	tx: Tx,
	titleIds: Map<string, number>,
	platformIds: Map<string, number>,
) {
	const rows = parseCsv("title_platforms.csv", titlePlatformRowSchema);

	await tx.insert(titlePlatforms).values(
		rows.map((r) => ({
			titleId: getId(titleIds, r._titles_slug, "title_platforms.csv"),
			platformId: getId(platformIds, r._platforms_name, "title_platforms.csv"),
		})),
	);

	return rows.length;
}

const titleStudioRowSchema = z.object({
	_titles_slug: z.string(),
	_production_studios_name: z.string(),
});

/** `title_production_studios`: productoras de cada obra. Depende de `titles` y `production_studios`. */
export async function seedTitleProductionStudios(
	tx: Tx,
	titleIds: Map<string, number>,
	studioIds: Map<string, number>,
) {
	const rows = parseCsv("title_production_studios.csv", titleStudioRowSchema);

	await tx.insert(titleProductionStudios).values(
		rows.map((r) => ({
			titleId: getId(titleIds, r._titles_slug, "title_production_studios.csv"),
			studioId: getId(studioIds, r._production_studios_name, "title_production_studios.csv"),
		})),
	);

	return rows.length;
}
