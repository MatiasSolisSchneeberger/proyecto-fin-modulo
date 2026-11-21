import { BadRequestError, NotFoundError } from "@/api/errors/app-error.js";
import { progressRepository } from "./repository.js";
import type { ListProgressQuery, UpsertProgressBody } from "./schema.js";

// reglas. El repository ya devuelve cada fila con la forma final (progreso + ítem + obra)

// el ítem de la línea temporal tiene que existir
const assertItemExists = async (itemId: number) => {
	if (!(await progressRepository.itemExists(itemId))) {
		throw new NotFoundError("ITEM_NOT_FOUND", `No existe el ítem con id ${itemId}`);
	}
};

// no se puede marcar como visto algo "en el futuro"
const assertNotFuture = (watchedAt: Date) => {
	if (watchedAt.getTime() > Date.now()) {
		throw new BadRequestError(
			"INVALID_WATCHED_AT",
			"La fecha en que lo viste no puede ser futura",
		);
	}
};

type ProgressRow = NonNullable<Awaited<ReturnType<typeof progressRepository.findOne>>>;

// mover `title`, `episode` y `edition` adentro de `item`:
// { itemId, status, watchedAt, item: { ..., title, episode, edition } }
// episode / edition son null cuando el ítem no es un episodio / una edición especial
const toDto = ({ title, episode, edition, item, ...progress }: ProgressRow) => ({
	...progress,
	item: { ...item, title, episode, edition },
});

export const progressService = {
	async list(userId: string, query: ListProgressQuery) {
		const { status, page, limit } = query;

		const [rows, total] = await Promise.all([
			progressRepository.findAll(userId, status, page, limit),
			progressRepository.count(userId, status),
		]);

		return {
			data: rows.map(toDto),
			meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	},

	async upsert(userId: string, itemId: number, body: UpsertProgressBody) {
		await assertItemExists(itemId);

		const watchedAt = body.watchedAt ?? new Date();
		assertNotFuture(watchedAt);

		await progressRepository.upsert(userId, itemId, body.status ?? "watched", watchedAt);

		// se vuelve a leer con el join para devolver el ítem completo
		const row = await progressRepository.findOne(userId, itemId);

		if (!row) {
			throw new Error("No se pudo leer el progreso guardado");
		}

		return toDto(row);
	},

	// idempotente: 204 aunque el ítem no estuviera marcado
	async remove(userId: string, itemId: number) {
		await assertItemExists(itemId);
		await progressRepository.remove(userId, itemId);
	},
};
