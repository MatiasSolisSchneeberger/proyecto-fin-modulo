import { z } from "zod";

export const registerBody = z.object({
	username: z.string().trim().min(3).max(50),
	email: z.string().trim().toLowerCase().pipe(z.email()),
	password: z.string().min(8).max(72),
});

export const loginBody = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email()),
	password: z.string().min(1),
});

export type RegisterBody = z.infer<typeof registerBody>;
export type LoginBody = z.infer<typeof loginBody>;
