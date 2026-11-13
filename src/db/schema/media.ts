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
	varchar,
} from "drizzle-orm/pg-core";
import { platforms, productionStudios, tags } from "./catalogs.js";

export const media = pgTable(
	"media",
	{
		id: serial("id").primaryKey(),
		title: varchar("title", { length: 255 }).notNull(),
		releaseDate: date("release_date").notNull(),
		durationMinutes: integer("duration_minutes").notNull(),
		orderKey: varchar("order_key", { length: 255 }).notNull().unique(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("idx_media_release_date").on(table.releaseDate),
		index("idx_media_title").on(table.title),
	],
);

export const mediaNotes = pgTable(
	"media_notes",
	{
		id: serial("id").primaryKey(),
		mediaId: integer("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		isSpoiler: boolean("is_spoiler").notNull().default(false),
		orderIndex: integer("order_index").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("idx_notes_media").on(table.mediaId)],
);

// relaciones

export const mediaProductionStudios = pgTable(
	"media_production_studios",
	{
		mediaId: integer("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		studioId: integer("studio_id")
			.notNull()
			.references(() => productionStudios.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.mediaId, table.studioId] })],
);

export const mediaPlatforms = pgTable(
	"media_platforms",
	{
		mediaId: integer("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		platformId: integer("platform_id")
			.notNull()
			.references(() => platforms.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.mediaId, table.platformId] })],
);

export const mediaTags = pgTable(
	"media_tags",
	{
		mediaId: integer("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		tagId: integer("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		isSpoiler: boolean("is_spoiler").notNull().default(false),
	},
	(table) => [
		primaryKey({ columns: [table.mediaId, table.tagId] }),
		index("idx_media_tags_tag").on(table.tagId),
	],
);
