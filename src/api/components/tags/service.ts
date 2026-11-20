import { NotFoundError } from "@/api/errors/app-error.js";
import { tagsRepository } from "@/api/components/tags/repository.js";
import type { ListTagsQuery } from "@/api/components/tags/schema.js";

// reglas y mapear a DTO

type TagRow = {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	category: string;
};
const toDto = (row: TagRow) => ({
	id: row.id,
	name: row.name,
	slug: row.slug,
	description: row.description,
	category: row.category,
});

export const tagsService = {
	async list(filters: ListTagsQuery) {
		const rows = await tagsRepository.findAll(filters);

		return rows.map(toDto);
	},

	async getBySlug(slug: string) {
		const row = await tagsRepository.findBySlug(slug);

		if (!row) {
			throw new NotFoundError("TAG_NOT_FOUND", `No existe el tag '${slug}'`);
		}

		return toDto(row);
	},
};
