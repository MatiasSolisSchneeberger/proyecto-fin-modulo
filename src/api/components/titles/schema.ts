import { z } from "zod";
import { titleKind } from "@/db/schema/index.js";

// validaciones con Zod

const dateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD");

export const listTitlesQuery = z.object({
	q: z.string().trim().min(1).max(100).optional(),
	kind: z.enum(titleKind.enumValues).optional(),
	releasedFrom: dateString.optional(),
	releasedTo: dateString.optional(),

	// no se usa z.coerce.boolean(): Boolean("false") === true
	includeNonCanon: z
		.enum(["true", "false"])
		.optional()
		.transform((v) => v === "true"),

	// "-" adelante = descendente. Lista blanca: nunca se arma un ORDER BY con lo que manda el cliente
	sort: z
		.enum([
			"title",
			"-title",
			"releaseDate",
			"-releaseDate",
			"createdAt",
			"-createdAt",
		])
		.default("releaseDate"),

	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const titleParams = z.object({
	id: z.coerce.number().int().positive(),
});

export type ListTitlesQuery = z.infer<typeof listTitlesQuery>;
export type TitleParams = z.infer<typeof titleParams>;
