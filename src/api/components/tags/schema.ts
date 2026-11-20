import { z } from "zod";

// validaciones con Zod

export const listTagsQuery = z.object({
	q: z.string().trim().min(1).max(100).optional(),
	categoryId: z.coerce.number().int().positive().optional(),
});

export const tagsParams = z.object({
	slug: z
		.string()
		.regex(/^[A-Za-z0-9_-]+$/)
		.max(100),
});

export type ListTagsQuery = z.infer<typeof listTagsQuery>;
export type TagsParams = z.infer<typeof tagsParams>;
