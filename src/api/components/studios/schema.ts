import { z } from "zod";
import { titleKind } from "@/db/schema/index.js";

// validaciones con Zod

const dateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD");

export const listStudiosQuery = z.object({
	q: z.string().trim().min(1).max(100).optional(),
});

export const studioParams = z.object({
	id: z.coerce.number().int().positive(),
});

export type ListTitlesQuery = z.infer<typeof listStudiosQuery>;
export type TitleParams = z.infer<typeof studioParams>;
