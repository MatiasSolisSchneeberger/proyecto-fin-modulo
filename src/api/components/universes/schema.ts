import { z } from "zod";

// validaciones con Zod

export const listaUniversesQuery = z.object({
	q: z.string().trim().min(1).max(100).optional(),
});

export const universeParams = z.object({
	code: z
		.string()
		.regex(/^[A-Za-z0-9_-]+$/)
		.max(50),
});

export type ListUniversesQuery = z.infer<typeof listaUniversesQuery>;
export type UniverseParams = z.infer<typeof universeParams>;
