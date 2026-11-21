import { BadRequestError, ConfictError, NotFoundError } from "@/api/errors/app-error.js";
import { titles } from "@/db/schema/index.js";
import { titlesRepository } from "./repository.js";
import type { CreateTitleBody, ListTitlesQuery, UpdateTitleBody } from "./schema.js";

// reglas y mapear a DTO

type TitleRow = typeof titles.$inferSelect;

const MIN_RELEASE_DATE = "1900-01-01";
const MAX_YEARS_AHEAD = 10;

// para pasar de "Iron Man 3!" a "iron-man-3"
const slugify = (text: string) =>
	text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

// la fecha de estreno tiene que ser razonable.
// Las fechas YYYY-MM-DD se pueden comparar como texto.
const assertValidReleaseDate = (releaseDate: string) => {
	const limit = new Date();

	limit.setFullYear(limit.getFullYear() + MAX_YEARS_AHEAD);

	const maxReleaseDate = limit.toISOString().slice(0, 10);

	if (releaseDate < MIN_RELEASE_DATE || releaseDate > maxReleaseDate) {
		throw new BadRequestError(
			"INVALID_RELEASE_DATE",
			`La fecha de estreno debe estar entre ${MIN_RELEASE_DATE} y ${maxReleaseDate}`,
		);
	}
};

// el slug identifica a la obra y no se puede repetir.
const assertSlugAvailable = async (slug: string) => {
	if (await titlesRepository.findBySlug(slug)) {
		throw new ConfictError(
			"TITLE_SLUG_TAKEN",
			`Ya existe una obra con el slug '${slug}'`,
		);
	}
};

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

	async create(body: CreateTitleBody) {
		assertValidReleaseDate(body.releaseDate);

		const slug = body.slug ?? slugify(body.title);
		await assertSlugAvailable(slug);

		const row = await titlesRepository.create({ ...body, slug });

		return toDto(row);
	},

	async update(id: number, body: UpdateTitleBody) {
		const current = await titlesRepository.findById(id);

		if (!current) {
			throw new NotFoundError("TITLE_NOT_FOUND", `No existe la obra con id ${id}`);
		}

		if (body.releaseDate !== undefined) {
			assertValidReleaseDate(body.releaseDate);
		}

		// solo chequea el slug si cambia: si manda el suyo propio no es conflicto
		if (body.slug !== undefined && body.slug !== current.slug) {
			await assertSlugAvailable(body.slug);
		}

		const row = await titlesRepository.update(id, body);

		if (!row) {
			throw new NotFoundError("TITLE_NOT_FOUND", `No existe la obra con id ${id}`);
		}

		return toDto(row);
	},

	async remove(id: number) {
		const row = await titlesRepository.remove(id);

		if (!row) {
			throw new NotFoundError("TITLE_NOT_FOUND", `No existe la obra con id ${id}`);
		}
	},
};
