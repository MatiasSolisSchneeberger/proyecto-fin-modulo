import {
	boolean,
	date,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { platforms, productionStudios, tags } from "./catalogs.js";
import { titleKind } from "./enums.js";

// OBRA: metadata global. Se edita acá y se refleja en todos sus ítems del timeline.
export const titles = pgTable(
	"titles",
	{
		id: serial("id").primaryKey(),
		kind: titleKind("kind").notNull(),
		title: varchar("title", { length: 255 }).notNull(),
		slug: varchar("slug", { length: 255 }).notNull().unique(),
		releaseDate: date("release_date").notNull(),
		posterUrl: text("poster_url"),
		synopsis: text("synopsis"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_titles_release_date").on(table.releaseDate),
		index("idx_titles_title").on(table.title),
		index("idx_titles_kind").on(table.kind),
	],
);

// Capítulos de una serie (series_id debe apuntar a un title con kind = 'series').
export const episodes = pgTable(
	"episodes",
	{
		id: serial("id").primaryKey(),
		seriesId: integer("series_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		seasonNumber: integer("season_number").notNull(),
		episodeNumber: integer("episode_number").notNull(),
		title: varchar("title", { length: 255 }).notNull(),
		airDate: date("air_date"),
	},
	(table) => [
		unique("uq_episodes_series_season_number").on(
			table.seriesId,
			table.seasonNumber,
			table.episodeNumber,
		),
	],
);

// Reestrenos / ediciones especiales (ej: Re-Release 2019, Encore).
export const titleEditions = pgTable(
	"title_editions",
	{
		id: serial("id").primaryKey(),
		titleId: integer("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		slug: varchar("slug", { length: 100 }).notNull(),
		name: varchar("name", { length: 150 }).notNull(),
		releaseDate: date("release_date").notNull(),
	},
	(table) => [unique("uq_editions_title_slug").on(table.titleId, table.slug)],
);

// relaciones M:N de la obra

export const titleProductionStudios = pgTable(
	"title_production_studios",
	{
		titleId: integer("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		studioId: integer("studio_id")
			.notNull()
			.references(() => productionStudios.id, { onDelete: "restrict" }),
	},
	(table) => [
		primaryKey({ columns: [table.titleId, table.studioId] }),
		index("idx_title_studios_studio").on(table.studioId),
	],
);

export const titlePlatforms = pgTable(
	"title_platforms",
	{
		titleId: integer("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		platformId: integer("platform_id")
			.notNull()
			.references(() => platforms.id, { onDelete: "restrict" }),
	},
	(table) => [
		primaryKey({ columns: [table.titleId, table.platformId] }),
		index("idx_title_platforms_platform").on(table.platformId),
	],
);

export const titleTags = pgTable(
	"title_tags",
	{
		titleId: integer("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		tagId: integer("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		isSpoiler: boolean("is_spoiler").notNull().default(false),
	},
	(table) => [
		primaryKey({ columns: [table.titleId, table.tagId] }),
		index("idx_title_tags_tag").on(table.tagId),
	],
);
