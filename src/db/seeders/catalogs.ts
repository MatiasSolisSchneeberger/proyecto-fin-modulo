import { z } from "zod";
import type { Tx } from "./types.js";
import { readCsv } from "./csv.js";
import {
	platforms,
	productionStudios,
	universes,
	tagCategories,
} from "../schema/index.js";

// universes

const universRowSchema = z.object({
	code: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

export async function seedUniverses(tx: Tx) {
	const rows = readCsv("universes.csv").map((raw, i) => {
		const result = universRowSchema.safeParse(raw);

		if (!result.success) {
			throw new Error(
				`universes.csv linea ${i + 2}:\n${z.prettifyError(result.error)}`,
			);
		}

		return result.data;
	});

	const values: (typeof universes.$inferInsert)[] = rows.map((r) => ({
		code: r.code,
		name: r.name,
		description: r.description,
	}));

	const inserted = await tx
		.insert(universes)
		.values(values)
		.returning({ id: universes.id, code: universes.code });

	return new Map(inserted.map((t) => [t.code, t.id]));
}

// production studio

const productionStudioRowSchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
});

export async function seedProductionStudios(tx: Tx) {
	const rows = readCsv("production_studios.csv").map((raw, i) => {
		const result = productionStudioRowSchema.safeParse(raw);

		if (!result.success) {
			throw new Error(
				`production_studios.csv linea ${i + 2}:\n${z.prettifyError(result.error)}`,
			);
		}

		return result.data;
	});

	const values: (typeof productionStudios.$inferInsert)[] = rows.map((r) => ({
		name: r.name,
		description: r.description,
	}));

	const inserted = await tx
		.insert(productionStudios)
		.values(values)
		.returning({ id: productionStudios.id, name: productionStudios.name });

	return new Map(inserted.map((t) => [t.name, t.id]));
}

// platforms

const platformsRowSchema = z.object({
	name: z.string(),
	website_url: z.string().nullable(),
});

export async function seedPlatforms(tx: Tx) {
	const rows = readCsv("platforms.csv").map((raw, i) => {
		const result = platformsRowSchema.safeParse(raw);

		if (!result.success) {
			throw new Error(
				`platforms.csv linea ${i + 2}:\n${z.prettifyError(result.error)}`,
			);
		}

		return result.data;
	});

	const values: (typeof platforms.$inferInsert)[] = rows.map((r) => ({
		name: r.name,
		websiteUrl: r.website_url,
	}));

	const inserted = await tx
		.insert(platforms)
		.values(values)
		.returning({ id: platforms.id, name: platforms.name });

	return new Map(inserted.map((t) => [t.name, t.id]));
}

// tag categories

const tagCategoriesRowSchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
});

export async function seedTagCategories(tx: Tx) {
	const rows = readCsv("tag_categories.csv").map((raw, i) => {
		const result = tagCategoriesRowSchema.safeParse(raw);

		if (!result.success) {
			throw new Error(
				`tag_categories.csv linea ${i + 2}:\n${z.prettifyError(result.error)}`,
			);
		}

		return result.data;
	});

	const values: (typeof tagCategories.$inferInsert)[] = rows.map((r) => ({
		name: r.name,
		description: r.description,
	}));

	const inserted = await tx
		.insert(tagCategories)
		.values(values)
		.returning({ id: tagCategories.id, name: tagCategories.name });

	return new Map(inserted.map((t) => [t.name, t.id]));
}
