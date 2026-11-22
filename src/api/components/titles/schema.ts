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

export const createTitleBody = z.object({
	kind: z.enum(titleKind.enumValues),
	title: z.string().trim().min(1).max(255),
	// si no viene, el service lo genera a partir del título
	slug: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones")
		.max(255)
		.optional(),
	releaseDate: dateString,
	posterUrl: z.url().optional(),
	synopsis: z.string().trim().min(1).optional(),
	isCanon: z.boolean().default(true),
});

// PUT: solo se actualizan los campos que lleguen, pero al menos uno
export const updateTitleBody = createTitleBody
	.omit({ isCanon: true })
	.extend({ isCanon: z.boolean().optional() })
	.partial()
	.refine((body) => Object.keys(body).length > 0, {
		message: "Enviá al menos un campo para actualizar",
	});

export type ListTitlesQuery = z.infer<typeof listTitlesQuery>;
export type TitleParams = z.infer<typeof titleParams>;
export type CreateTitleBody = z.infer<typeof createTitleBody>;
export type UpdateTitleBody = z.infer<typeof updateTitleBody>;
