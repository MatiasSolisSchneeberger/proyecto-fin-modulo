import { asc } from "drizzle-orm";
import { db } from "@/db/client.js";
import { tagCategories } from "@/db/schema/index.js";

// solo Drizzle

export const tagCategoriesRepository = {
	findAll() {
		return db.select().from(tagCategories).orderBy(asc(tagCategories.id));
	},
};
