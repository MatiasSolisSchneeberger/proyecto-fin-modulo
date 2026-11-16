import { pgEnum } from "drizzle-orm/pg-core";

// Todos los enums viven acá para evitar imports circulares entre tablas.

export const titleKind = pgEnum("title_kind", ["movie", "series", "short", "special"]);

export const itemSegment = pgEnum("item_segment", [
	"full", // obra completa en un solo bloque
	"main", // cuerpo principal de una película partida en segmentos
	"post_credits", // escena de créditos / post-créditos con posición propia
	"bonus", // re-release, cut alternativo, extras
	"episode", // episodio de una serie
]);

export const watchStatus = pgEnum("watch_status", ["watched", "skipped"]);

export const userRole = pgEnum("user_role", ["user", "admin"]);
