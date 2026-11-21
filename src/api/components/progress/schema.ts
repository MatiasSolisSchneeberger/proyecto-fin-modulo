import { z } from "zod";
import { watchStatus } from "@/db/schema/index.js";

// validaciones con Zod

export const progressParams = z.object({
	itemId: z.coerce.number().int().positive(),
});

// PUT: todo es opcional. Los defaults (watched, ahora) los resuelve el service
export const upsertProgressBody = z.object({
	status: z.enum(watchStatus.enumValues).optional(),
	// ISO 8601 con zona horaria (ej. 2026-11-21T20:00:00Z) → se convierte a Date
	watchedAt: z.iso
		.datetime({ offset: true })
		.transform((value) => new Date(value))
		.optional(),
});

export const listProgressQuery = z.object({
	status: z.enum(watchStatus.enumValues).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProgressParams = z.infer<typeof progressParams>;
export type UpsertProgressBody = z.infer<typeof upsertProgressBody>;
export type ListProgressQuery = z.infer<typeof listProgressQuery>;
