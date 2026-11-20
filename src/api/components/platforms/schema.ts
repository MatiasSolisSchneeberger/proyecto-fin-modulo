import { z } from "zod";

// validaciones con Zod

export const listPlatformsQuery = z.object({
	q: z.string().trim().min(1).max(100).optional(),
});

export const platformParams = z.object({
	id: z.coerce.number().int().positive(),
});

export type ListPlatformsQuery = z.infer<typeof listPlatformsQuery>;
export type PlatformParams = z.infer<typeof platformParams>;
