import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const movieTypes = pgTable("movie_types", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	description: text("description"),
});

export const productionStudios = pgTable("production_studios", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	description: text("description"),
});

export const platforms = pgTable("platforms", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	websiteUrl: varchar("website_url", { length: 255 }),
});

export const tagCategories = pgTable("tag_categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	description: text("description"),
});

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	description: text("description"),

	// referencias
	categoryId: integer("category_id")
		.notNull()
		.references(() => tagCategories.id),
});
