import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client.js";
import {
	episodes,
	timelineItems,
	titleEditions,
	titles,
	userWatchProgress,
} from "@/db/schema/index.js";

// solo Drizzle

type WatchStatus = (typeof userWatchProgress.$inferSelect)["status"];

// Drizzle permite agrupar columnas en objetos, pero solo un nivel de anidación:
// por eso `item` y `title` quedan hermanos y el service arma el anidado final
const progressSelect = {
	itemId: userWatchProgress.itemId,
	status: userWatchProgress.status,
	watchedAt: userWatchProgress.watchedAt,
	item: {
		id: timelineItems.id,
		label: timelineItems.label,
		segment: timelineItems.segment,
		durationMinutes: timelineItems.durationMinutes,
	},
	title: {
		id: titles.id,
		title: titles.title,
		slug: titles.slug,
	},
	// solo existen para ítems de tipo episode / bonus: con leftJoin vienen null si no aplican
	episode: {
		seasonNumber: episodes.seasonNumber,
		episodeNumber: episodes.episodeNumber,
		title: episodes.title,
	},
	edition: {
		slug: titleEditions.slug,
		name: titleEditions.name,
	},
};

// progreso + ítem + obra (innerJoin: las FK son NOT NULL, siempre hay match)
// + episodio y edición (leftJoin: son opcionales)
const selectProgress = () =>
	db
		.select(progressSelect)
		.from(userWatchProgress)
		.innerJoin(timelineItems, eq(timelineItems.id, userWatchProgress.itemId))
		.innerJoin(titles, eq(titles.id, timelineItems.titleId))
		.leftJoin(episodes, eq(episodes.id, timelineItems.episodeId))
		.leftJoin(titleEditions, eq(titleEditions.id, timelineItems.editionId));

// toda consulta filtra por userId: es lo que aísla los datos de cada usuario
const buildWhere = (userId: string, status?: WatchStatus) =>
	and(
		eq(userWatchProgress.userId, userId),
		status ? eq(userWatchProgress.status, status) : undefined,
	);

export const progressRepository = {
	async itemExists(itemId: number) {
		const [row] = await db
			.select({ id: timelineItems.id })
			.from(timelineItems)
			.where(eq(timelineItems.id, itemId))
			.limit(1);
		return row !== undefined;
	},

	// upsert: si (userId, itemId) ya existe, actualiza status y watchedAt
	async upsert(userId: string, itemId: number, status: WatchStatus, watchedAt: Date) {
		await db
			.insert(userWatchProgress)
			.values({ userId, itemId, status, watchedAt })
			.onConflictDoUpdate({
				target: [userWatchProgress.userId, userWatchProgress.itemId],
				set: { status, watchedAt },
			});
	},

	async findOne(userId: string, itemId: number) {
		const [row] = await selectProgress()
			.where(and(buildWhere(userId), eq(userWatchProgress.itemId, itemId)))
			.limit(1);
		return row; // undefined si no está marcado
	},

	async remove(userId: string, itemId: number) {
		await db
			.delete(userWatchProgress)
			.where(
				and(eq(userWatchProgress.userId, userId), eq(userWatchProgress.itemId, itemId)),
			);
	},

	findAll(userId: string, status: WatchStatus | undefined, page: number, limit: number) {
		return (
			selectProgress()
				.where(buildWhere(userId, status))
				// itemId desempata para que la paginación sea estable
				.orderBy(desc(userWatchProgress.watchedAt), asc(userWatchProgress.itemId))
				.limit(limit)
				.offset((page - 1) * limit)
		);
	},

	count(userId: string, status: WatchStatus | undefined) {
		return db.$count(userWatchProgress, buildWhere(userId, status));
	},
};
