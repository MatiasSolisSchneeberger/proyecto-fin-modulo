import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { universes } from "./catalogs.js";
import { textC } from "./custom-types.js";
import { itemSegment } from "./enums.js";
import { episodes, titleEditions, titles } from "./titles.js";

// ÍTEM VISIBLE: lo que se mira y se marca como visto.
export const timelineItems = pgTable(
	"timeline_items",
	{
		id: serial("id").primaryKey(),
		titleId: integer("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		episodeId: integer("episode_id")
			.unique()
			.references(() => episodes.id, { onDelete: "cascade" }),
		editionId: integer("edition_id").references(() => titleEditions.id, { onDelete: "cascade" }),
		segment: itemSegment("segment").notNull().default("full"),
		label: varchar("label", { length: 150 }),
		description: text("description"),
		durationMinutes: integer("duration_minutes").notNull(),
		universeId: integer("universe_id")
			.notNull()
			.references(() => universes.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("idx_items_title").on(table.titleId),
		index("idx_items_universe").on(table.universeId),
		index("idx_items_edition").on(table.editionId),
		index("idx_items_segment").on(table.segment),
		check("ck_items_duration_positive", sql`${table.durationMinutes} > 0`),
		check(
			"ck_items_episode_segment",
			sql`(${table.episodeId} IS NOT NULL) = (${table.segment} = 'episode')`,
		),
		// una obra no tiene dos cuerpos principales (las ediciones solo suman extras)
		uniqueIndex("uq_items_title_main")
			.on(table.titleId, table.segment)
			.where(sql`${table.segment} IN ('full', 'main') AND ${table.editionId} IS NULL`),
	],
);

export const timelineItemNotes = pgTable(
	"timeline_item_notes",
	{
		id: serial("id").primaryKey(),
		itemId: integer("item_id")
			.notNull()
			.references(() => timelineItems.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		isSpoiler: boolean("is_spoiler").notNull().default(false),
		orderIndex: integer("order_index").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("idx_notes_item").on(table.itemId)],
);

// POSICIÓN: un orden de visualización (cronológico, de estreno, listas curadas...).
export const timelines = pgTable(
	"timelines",
	{
		id: serial("id").primaryKey(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		name: varchar("name", { length: 150 }).notNull(),
		description: text("description"),
		isDefault: boolean("is_default").notNull().default(false),
	},
	(table) => [
		// a lo sumo un timeline por defecto
		uniqueIndex("uq_timelines_default")
			.on(table.isDefault)
			.where(sql`${table.isDefault}`),
	],
);

export const timelineEntries = pgTable(
	"timeline_entries",
	{
		timelineId: integer("timeline_id")
			.notNull()
			.references(() => timelines.id, { onDelete: "cascade" }),
		itemId: integer("item_id")
			.notNull()
			.references(() => timelineItems.id, { onDelete: "cascade" }),
		orderKey: textC("order_key").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.timelineId, table.itemId] }),
		uniqueIndex("uq_entries_timeline_order").on(table.timelineId, table.orderKey),
		index("idx_entries_item").on(table.itemId),
	],
);
