import { tagCategories } from "@/db/schema/index.js";
import { tagCategoriesRepository } from "./repository.js";

// reglas y mapear a DTO

type TagCategoryRow = typeof tagCategories.$inferSelect;

const toDto = (row: TagCategoryRow) => ({
	id: row.id,
	name: row.name,
	description: row.description,
});

export const tagCategoriesService = {
	async list() {
		const rows = await tagCategoriesRepository.findAll();

		return rows.map(toDto);
	},
};
