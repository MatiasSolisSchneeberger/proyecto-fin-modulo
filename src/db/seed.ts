import { sql } from "drizzle-orm";
import { db } from "./client.js";
import {
	seedPlatforms,
	seedProductionStudios,
	seedTagCategories,
	seedUniverses,
} from "./seeders/catalogs.js";
import { seedEpisodes } from "./seeders/episodes.js";
import { seedTags } from "./seeders/tags.js";
import { seedTitleEditions } from "./seeders/title-editions.js";
import {
	seedTitlePlatforms,
	seedTitleProductionStudios,
	seedTitleTags,
} from "./seeders/title-relations.js";
import { seedTitles } from "./seeders/titles.js";
import {
	seedTimelineEntries,
	seedTimelineItemNotes,
	seedTimelineItems,
	seedTimelines,
} from "./seeders/timeline.js";

async function main() {
	// UNA sola transacción: o se carga todo o no se carga nada.
	await db.transaction(async (tx) => {
		// Limpieza para poder correr el seed N veces. Se listan solo las tablas "raíz":
		// CASCADE vacía también las que las referencian (episodes, items, entries, progreso...).
		// ⚠️ Borra user_watch_progress: solo para desarrollo, nunca contra producción.
		await tx.execute(sql`
			TRUNCATE TABLE titles, universes, production_studios, platforms,
			               tag_categories, timelines
			RESTART IDENTITY CASCADE
		`);

		// El orden lo dicta el grafo de FK: cada paso va después de los Maps que necesita.

		// 1) tablas sin FK
		const titleIds = await seedTitles(tx);
		const universeIds = await seedUniverses(tx);
		const studioIds = await seedProductionStudios(tx);
		const platformIds = await seedPlatforms(tx);
		const tagCategoryIds = await seedTagCategories(tx);
		const timelineIds = await seedTimelines(tx);
		console.log(
			`✅ titles: ${titleIds.size} | universes: ${universeIds.size} | studios: ${studioIds.size} | platforms: ${platformIds.size} | tag categories: ${tagCategoryIds.size} | timelines: ${timelineIds.size}`,
		);

		// 2) tablas que dependen de las anteriores
		const tagIds = await seedTags(tx, tagCategoryIds);
		const episodeIds = await seedEpisodes(tx, titleIds);
		const editionIds = await seedTitleEditions(tx, titleIds);
		console.log(
			`✅ tags: ${tagIds.size} | episodes: ${episodeIds.size} | editions: ${editionIds.size}`,
		);

		// 3) N:M de titles (sin Map de retorno: nadie las referencia)
		const nTitleTags = await seedTitleTags(tx, titleIds, tagIds);
		const nTitlePlatforms = await seedTitlePlatforms(tx, titleIds, platformIds);
		const nTitleStudios = await seedTitleProductionStudios(tx, titleIds, studioIds);
		console.log(
			`✅ title_tags: ${nTitleTags} | title_platforms: ${nTitlePlatforms} | title_production_studios: ${nTitleStudios}`,
		);

		// 4) ítems del timeline y sus notas
		const itemIds = await seedTimelineItems(tx, {
			titleIds,
			episodeIds,
			editionIds,
			universeIds,
		});
		const nNotes = await seedTimelineItemNotes(tx, itemIds);
		console.log(`✅ timeline_items: ${itemIds.size} | notes: ${nNotes}`);

		// 5) orden de cada timeline (Fractional Indexing)
		const nEntries = await seedTimelineEntries(tx, timelineIds, itemIds);
		console.log(`✅ timeline_entries: ${nEntries}`);
	});
}

main()
	.then(() => console.log("Seed OK"))
	.catch((error) => {
		console.error("Seed falló, no se guardó nada (rollback): ", error);
		process.exitCode = 1;
	})
	.finally(() => db.$client.end());
