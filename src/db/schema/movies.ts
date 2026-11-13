import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { media } from "./media.js";
import { movieTypes } from "./catalogs.js";

export const movies = pgTable("movies", {
	mediaId: integer("media_id")
		.primaryKey()
		.references(() => media.id, { onDelete: "cascade" }),
	movieTypeId: integer("movie_type_id")
		.notNull()
		.references(() => movieTypes.id),
	posterUrl: text("poster_url"),
	synopsis: text("synopsis"),
});

export const postCreditsScenes = pgTable("post_credits_scenes", {
	mediaId: integer("media_id")
		.primaryKey()
		.references(() => media.id, { onDelete: "cascade" }),
	sourceMovieId: integer("source_movie_id")
		.notNull()
		.references(() => movies.mediaId, { onDelete: "cascade" }),
	description: text("description"),
});
