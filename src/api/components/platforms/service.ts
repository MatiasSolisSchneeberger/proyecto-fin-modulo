import { NotFoundError } from "@/api/errors/app-error.js";
import { platforms } from "@/db/schema/index.js";
import { platformsRepository } from "./repository.js";
import type { ListPlatformsQuery } from "./schema.js";

// reglas y mapear a DTO

type PlatformRow = typeof platforms.$inferSelect;

const toDto = (row: PlatformRow) => ({
	id: row.id,
	name: row.name,
	websiteUrl: row.websiteUrl,
});

export const platformsService = {
	async list(query: ListPlatformsQuery) {
		const rows = await platformsRepository.findAll(query);

		return rows.map(toDto);
	},

	async getById(id: number) {
		const row = await platformsRepository.findById(id);

		if (!row) {
			throw new NotFoundError(
				"PLATFORM_NOT_FOUND",
				`No existe la plataforma con id ${id}`,
			);
		}

		return toDto(row);
	},
};
