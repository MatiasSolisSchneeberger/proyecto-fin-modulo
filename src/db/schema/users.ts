import { sql } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { userRole, watchStatus } from "./enums.js";
import { timelineItems } from "./timeline.js";

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		username: varchar("username", { length: 50 }).notNull().unique(),
		email: varchar("email", { length: 255 }).notNull(),
		role: userRole("role").notNull().default("user"),
		password: varchar("password", { length: 255 }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		// email único sin distinguir mayúsculas
		uniqueIndex("uq_users_email_lower").on(sql`lower(${table.email})`),
	],
);

// La ausencia de fila = pendiente.
export const userWatchProgress = pgTable(
	"user_watch_progress",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		itemId: integer("item_id")
			.notNull()
			.references(() => timelineItems.id, { onDelete: "cascade" }),
		status: watchStatus("status").notNull().default("watched"),
		watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.itemId] }),
		index("idx_progress_item").on(table.itemId),
	],
);
