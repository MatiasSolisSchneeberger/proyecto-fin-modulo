import {
	integer,
	pgEnum,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { media } from "./media.js";

// listas
export const watchStatus = pgEnum("watch_status", ["watched", "skipped"]);
export const userRole = pgEnum("user_role", ["user", "admin"]);

// tablas
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	username: varchar("username", { length: 50 }).notNull().unique(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	role: userRole("role").notNull().default("user"),
	password: varchar("password", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userWatchProgress = pgTable(
	"user_watch_progress",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mediaId: integer("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		status: watchStatus("status").notNull().default("watched"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [unique().on(table.userId, table.mediaId)],
);
