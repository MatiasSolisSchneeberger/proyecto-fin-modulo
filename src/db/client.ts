import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";
import { env } from "@/config/env.js";

export const db = drizzle(env.DATABASE_URL);
