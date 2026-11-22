import { z } from "zod";
import type { Tx } from "./types.js";
import { csvInt, getId, readCsv } from "./csv.js";
import { episodes } from "../schema/index.js";

const episodesRowSchema = z.object({
	_titles_slug: z.string(),
	season_number: csvInt, // el CSV trae texto: "3" → 3
	episode_number: csvInt,
	title: z.string(),
	// iso porque va como texto
	air_date: z.iso.date().nullable(),
});

export async function seedEpisodes(tx: Tx, titleIds: Map<string, number>) {
	const rows = readCsv("episodes.csv").map((raw, i) => {
		const result = episodesRowSchema.safeParse(raw);

		if (!result.success) {
			throw new Error(
				`episodes.csv linea ${i + 2}:\n${z.prettifyError(result.error)}`,
			);
		}

		return result.data;
	});

	const inserted = await tx
		.insert(episodes)
		.values(
			rows.map((r) => ({
				seriesId: getId(titleIds, r._titles_slug, `episodes.csv ${r.title}`),
				seasonNumber: r.season_number,
				episodeNumber: r.episode_number,
				title: r.title,
				airDate: r.air_date,
			})),
		)
		.returning({
			id: episodes.id,
			seriesId: episodes.seriesId,
			season: episodes.seasonNumber,
			number: episodes.episodeNumber,
		});

	// returning te da seriesId (número), pero los CSV hijos hablan en slug:
	// invertís el Map de titles (id → slug) para armar la clave compuesta "loki|1|3" → id
	const slugById = new Map([...titleIds].map(([slug, id]) => [id, slug]));

	return new Map(
		inserted.map((e) => [
			`${slugById.get(e.seriesId)}|${e.season}|${e.number}`,
			e.id,
		]),
	);
}
