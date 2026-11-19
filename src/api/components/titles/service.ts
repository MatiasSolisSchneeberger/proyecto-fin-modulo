import { NotFoundError } from "@/api/errors/app-error.js";
import { titles } from "@/db/schema/index.js";
import { titlesRepository } from "./repository.js";
import type { ListTitlesQuery } from "./schema.js";

// reglas y mapear a DTO

type TitleRow = typeof titles.$inferSelect;

const toDto = (row: TitleRow) => ({
	id: row.id,
	kind: row.kind,
	title: row.title,
	slug: row.slug,
	releaseDate: row.releaseDate,
	posterUrl: row.posterUrl,
	synopsis: row.synopsis,
	isCanon: row.isCanon,
	createdAt: row.createdAt,
	updatedAt: row.updatedAt,
});

export const titlesService = {
	async list(query: ListTitlesQuery) {
		const { sort, page, limit, ...filters } = query;

		const [rows, total] = await Promise.all([
			titlesRepository.findAll(filters, sort, page, limit),
			titlesRepository.count(filters),
		]);

		return {
			data: rows.map(toDto),
			meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	},

	async getById(id: number) {
		const row = await titlesRepository.findById(id);

		if (!row) {
			throw new NotFoundError("TITLE_NOT_FOUND", `No existe la obra con id ${id}`);
		}

		return toDto(row);
	},
};
