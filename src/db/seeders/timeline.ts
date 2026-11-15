import { generateNKeysBetween } from "fractional-indexing";
import { z } from "zod";
import {
	itemSegment,
	timelineEntries,
	timelineItemNotes,
	timelineItems,
	timelines,
} from "../schema/index.js";
import { csvBool, csvInt, getId, parseCsv } from "./csv.js";
import type { Tx } from "./types.js";

//  --- timelines ---

const timelineRowSchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	is_default: csvBool,
});

/**
 * Inserta `timelines` (los órdenes de visualización: cronológico, de estreno...).
 * No depende de nadie.
 *
 * @returns Map `slug → id`, lo necesita `timeline_entries`.
 */
export async function seedTimelines(tx: Tx) {
	const rows = parseCsv("timelines.csv", timelineRowSchema);

	const inserted = await tx
		.insert(timelines)
		.values(
			rows.map((r) => ({
				slug: r.slug,
				name: r.name,
				description: r.description,
				isDefault: r.is_default,
			})),
		)
		.returning({ id: timelines.id, slug: timelines.slug });

	return new Map(inserted.map((t) => [t.slug, t.id]));
}

// --- items ---

const itemRowSchema = z.object({
	item_name_: z.string(), // nombre único del ítem: es la clave natural para notas y entries
	_titles_slug: z.string(),
	_episodes_season_number: csvInt.nullable(),
	_episodes_episode_number: csvInt.nullable(),
	_title_editions_slug: z.string().nullable(),
	segment: z.enum(itemSegment.enumValues).nullable(), // vacío → default "full" de la base
	label: z.string().nullable(),
	description: z.string().nullable(),
	duration_minutes: csvInt,
	_universes_code: z.string(),
});

/** Los inputs que necesita `seedTimelineItems`: un Map por tabla referenciada. */
export type ItemDeps = {
	titleIds: Map<string, number>;
	/** clave `"<serie>|<temporada>|<episodio>"` (la que arma `seedEpisodes`). */
	episodeIds: Map<string, number>;
	/** clave `"<obra>|<edición>"` (la que arma `seedTitleEditions`). */
	editionIds: Map<string, number>;
	universeIds: Map<string, number>;
};

/**
 * Inserta `timeline_items`: lo que el usuario mira y marca como visto.
 * Es la tabla con más FK. Reglas del CSV:
 *  - `episode_id` solo se resuelve si el ítem es un episodio (si no, queda null).
 *  - `edition_id` solo se resuelve si la fila trae `_title_editions_slug`.
 *  - el schema tiene un CHECK que exige `episode_id` NOT NULL ⇔ `segment = 'episode'`,
 *    así que un CSV inconsistente falla acá en vez de colarse.
 *
 * @returns Map `item_name_ → id`, lo usan `timeline_item_notes` y `timeline_entries`.
 */
export async function seedTimelineItems(tx: Tx, deps: ItemDeps) {
	const rows = parseCsv("timeline_items.csv", itemRowSchema);

	const values: (typeof timelineItems.$inferInsert)[] = rows.map((r) => {
		const ctx = `timeline_items.csv ${r.item_name_}`;
		const isEpisode = r.segment === "episode";

		return {
			titleId: getId(deps.titleIds, r._titles_slug, ctx),
			episodeId: isEpisode
				? getId(
						deps.episodeIds,
						`${r._titles_slug}|${r._episodes_season_number}|${r._episodes_episode_number}`,
						ctx,
					)
				: null,
			editionId: r._title_editions_slug
				? getId(
						deps.editionIds,
						`${r._titles_slug}|${r._title_editions_slug}`,
						ctx,
					)
				: null,
			// undefined = "no mandes la columna" → Postgres aplica el default ("full")
			segment: r.segment ?? undefined,
			label: r.label,
			description: r.description,
			durationMinutes: r.duration_minutes,
			universeId: getId(deps.universeIds, r._universes_code, ctx),
		};
	});

	const inserted = await tx
		.insert(timelineItems)
		.values(values)
		.returning({ id: timelineItems.id });

	// returning mantiene el orden de `values`, que es el de las filas: la posición i
	// de `inserted` corresponde a la fila i del CSV, de ahí sale el nombre.
	const itemIds = new Map(inserted.map((item, i) => [rows[i]!.item_name_, item.id]));

	// si dos filas comparten nombre el Map se pisa en silencio: lo detecto acá
	if (itemIds.size !== rows.length) {
		throw new Error("timeline_items.csv: hay `item_name_` repetidos");
	}

	return itemIds;
}

// -------------------------------------------------------------------- notes

const itemNoteRowSchema = z.object({
	_timeline_items_item_name: z.string(),
	content: z.string(),
	is_spoiler: csvBool,
	order_index: csvInt,
});

/**
 * Inserta `timeline_item_notes`. Depende de `timeline_items`.
 *
 * @param itemIds - Map `item_name_ → id` que devuelve `seedTimelineItems`.
 */
export async function seedTimelineItemNotes(tx: Tx, itemIds: Map<string, number>) {
	const rows = parseCsv("timeline_item_notes.csv", itemNoteRowSchema);

	await tx.insert(timelineItemNotes).values(
		rows.map((r) => ({
			itemId: getId(
				itemIds,
				r._timeline_items_item_name,
				"timeline_item_notes.csv",
			),
			content: r.content,
			isSpoiler: r.is_spoiler,
			orderIndex: r.order_index,
		})),
	);

	return rows.length;
}

// ------------------------------------------------------------------ entries

const entryRowSchema = z.object({
	_timelines_slug: z.string(),
	_timeline_items_item_name: z.string(),
	// no hay columna order_key: el orden ES la posición de la fila en el CSV
});

/**
 * Inserta `timeline_entries`: en qué posición va cada ítem dentro de cada timeline.
 *
 * El orden de las filas del CSV (dentro de cada timeline) es la fuente de verdad.
 * Por cada timeline se piden de una sola vez N claves de Fractional Indexing
 * (`generateNKeysBetween(null, null, n)` → n claves ya ordenadas) y la fila i recibe la clave i.
 * Para insertar un ítem en el medio basta con agregar una fila en el CSV: no hay que renumerar nada.
 *
 * @param timelineIds - Map `slug → id` que devuelve `seedTimelines`.
 * @param itemIds - Map `item_name_ → id` que devuelve `seedTimelineItems`.
 */
export async function seedTimelineEntries(
	tx: Tx,
	timelineIds: Map<string, number>,
	itemIds: Map<string, number>,
) {
	const rows = parseCsv("timeline_entries.csv", entryRowSchema);

	// 1) agrupo las filas por timeline conservando el orden en que aparecen en el CSV
	const rowsByTimeline = new Map<string, typeof rows>();
	for (const row of rows) {
		const group = rowsByTimeline.get(row._timelines_slug) ?? [];
		group.push(row);
		rowsByTimeline.set(row._timelines_slug, group);
	}

	// 2) por cada timeline: N claves de una vez y la fila i recibe la clave i
	const values: (typeof timelineEntries.$inferInsert)[] = [];
	for (const [slug, group] of rowsByTimeline) {
		const keys = generateNKeysBetween(null, null, group.length);

		group.forEach((row, i) => {
			values.push({
				timelineId: getId(timelineIds, slug, "timeline_entries.csv"),
				itemId: getId(
					itemIds,
					row._timeline_items_item_name,
					`timeline_entries.csv ${slug}`,
				),
				orderKey: keys[i]!,
			});
		});
	}

	// (timeline_id, item_id) es PK: un ítem repetido en el mismo timeline hace fallar el insert
	await tx.insert(timelineEntries).values(values);

	return values.length;
}
