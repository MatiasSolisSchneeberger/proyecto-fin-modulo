import { NotFoundError } from "@/api/errors/app-error.js";
import { universes } from "@/db/schema/index.js";
import { universesRepository } from "@/api/components/universes/repository.js";
import type { ListUniversesQuery } from "@/api/components/universes/schema.js";

// reglas y mapear a DTO

type UniverseRow = typeof universes.$inferSelect;

const toDto = (row: UniverseRow) => ({
	code: row.code,
	name: row.name,
	description: row.description,
});

export const universesService = {
	async list(filters: ListUniversesQuery) {
		const rows = await universesRepository.findAll(filters);

		return rows.map(toDto);
	},

	async getByCode(code: string) {
		const row = await universesRepository.findByCode(code);

		if (!row) {
			throw new NotFoundError(
				"UNIVERSE_NOT_FOUND",
				`No existe el universo '${code}'`,
			);
		}

		return toDto(row);
	},
};
