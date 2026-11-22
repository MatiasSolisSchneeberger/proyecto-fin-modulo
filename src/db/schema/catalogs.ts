import { index, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const universes = pgTable("universes", {
	id: serial("id").primaryKey(),
	code: varchar("code", { length: 50 }).notNull().unique(),
	name: varchar("name", { length: 150 }).notNull(),
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

export const tags = pgTable(
	"tags",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		description: text("description"),
		categoryId: integer("category_id")
			.notNull()
			.references(() => tagCategories.id, { onDelete: "restrict" }),
	},
	(table) => [index("idx_tags_category").on(table.categoryId)],
);
