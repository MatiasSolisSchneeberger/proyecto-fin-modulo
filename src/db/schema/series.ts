import {
	date,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { media } from "./media.js";

export const series = pgTable("series", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	releaseDate: date("release_date").notNull(),
	posterUrl: text("poster_url"),
	synopsis: text("synopsis"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const episodes = pgTable(
	"episodes",
	{
		mediaId: integer("media_id")
			.primaryKey()
			.references(() => media.id, { onDelete: "cascade" }),
		seriesId: integer("series_id")
			.notNull()
			.references(() => series.id, { onDelete: "cascade" }),
		seasonNumber: integer("season_number").notNull(),
		episodeNumber: integer("episode_number").notNull(),
	},
	(table) => [
		unique().on(table.seriesId, table.seasonNumber, table.episodeNumber),
		index("idx_episodes_series").on(table.seriesId),
	],
);
