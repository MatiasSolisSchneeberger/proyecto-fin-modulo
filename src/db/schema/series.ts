import { date, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { media } from "./media.js";

export const series = pgTable("series", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	releaseDate: date("release_date").notNull(),
	posterUrl: text("poster_url"),
	synopsis: text("synopsis"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const episodes = pgTable("episodes", {
	mediaId: integer("media_id")
		.primaryKey()
		.references(() => media.id, { onDelete: "cascade" }),
	seriesId: integer("series_id")
		.notNull()
		.references(() => series.id, { onDelete: "cascade" }),
	seasonNumber: integer("season_number").notNull(),
	episodeNumber: integer("episode_number").notNull(),
});
