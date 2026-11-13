import "./load-env.js";
import { z } from "zod";

const envSchema = z.object({
	// coerce pasa de string a numero
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string().startsWith("postgresql://"),

	// para mas tarde
	//JWT_SECRET: z.string().min(16),
	//JWT_EXPIRES_IN: z.string().default("1h"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Variables de entonro invalidos: \n" + z.prettifyError(parsed.error));
	process.exit(1);
}

export const env = parsed.data;
