import { NotFoundError } from "@/api/errors/app-error.js";
import { productionStudios } from "@/db/schema/index.js";
import { studiosRepository } from "./repository.js";
import type { ListTitlesQuery } from "./schema.js";

type StudioRow = typeof productionStudios.$inferSelect;

const toDto = (row: StudioRow) => ({
	id: row.id,
	name: row.name,
	description: row.description,
});

export const studiosService = {
	async list(query: ListTitlesQuery) {
		const rows = await studiosRepository.findAll(query);

		return rows.map(toDto);
	},

	async getById(id: number) {
		const row = await studiosRepository.findById(id);

		if (!row) {
			throw new NotFoundError(
				"STUDIO_NOT_FOUND",
				`No existe el estudio de producción con id ${id}`,
			);
		}

		return toDto(row);
	},
};
