import "./load-env.js";
import { z } from "zod";

// una variable vacía (ADMIN_EMAIL=) cuenta como "no definida"
const optionalVar = <T extends z.ZodType>(schema: T) =>
	z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z.object({
	// coerce pasa de string a numero
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string().startsWith("postgresql://"),

	JWT_SECRET: z.string().min(16),
	JWT_EXPIRES_IN: z.string().default("1h"),

	// solo los usa el seed para crear el admin; la API arranca sin ellos
	ADMIN_USERNAME: optionalVar(z.string().min(3).max(50)),
	ADMIN_EMAIL: optionalVar(z.email()),
	ADMIN_PASSWORD: optionalVar(z.string().min(8).max(72)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Variables de entonro invalidos: \n" + z.prettifyError(parsed.error));
	process.exit(1);
}

export const env = parsed.data;
