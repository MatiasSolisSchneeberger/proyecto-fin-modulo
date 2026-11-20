import { db } from "@/db/client.js";
import { tagCategories, tags } from "@/db/schema/index.js";
import { and, asc, eq, ilike } from "drizzle-orm";

// solo Drizzle

export const tagsRepository = {
	findAll(filters: { q?: string | undefined; categoryId?: number | undefined }) {
		const { q, categoryId } = filters;

		return db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
				description: tags.description,
				category: tagCategories.name,
			})
			.from(tags)
			.innerJoin(tagCategories, eq(tags.categoryId, tagCategories.id))
			.where(
				and(
					q ? ilike(tags.name, `%${q}%`) : undefined,
					categoryId ? eq(tags.categoryId, categoryId) : undefined,
				),
			)
			.orderBy(asc(tagCategories.name), asc(tags.name));
	},

	async findBySlug(slug: string) {
		const [row] = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
				description: tags.description,
				category: tagCategories.name,
			})
			.from(tags)
			.innerJoin(tagCategories, eq(tags.categoryId, tagCategories.id))
			.where(eq(tags.slug, slug))
			.limit(1);

		return row;
	},
};
