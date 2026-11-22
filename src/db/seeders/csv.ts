import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { z } from "zod";

// npm run ejecuta desde la raíz del proyecto, así que esto resuelve a <raíz>/docs/csv
const CSV_DIR = path.resolve("docs/csv");

export type CsvRow = Record<string, string | null>;

export function readCsv(file: string): CsvRow[] {
	const content = readFileSync(path.join(CSV_DIR, file), "utf8");

	return parse(content, {
		columns: true, // la primera línea son los nombres de columna → objetos
		bom: true, // 1) saca el ﻿ del principio (si no, la columna es "﻿id")
		skip_empty_lines: true,
		trim: true,
		// 2) campos vacíos → null (en vez de "")
		// (3) las comas dentro de comillas ya las maneja el parser: "Turn, Turn, Turn" es un solo campo)
		cast: (value, context) => (context.quoting || value !== "" ? value : null),
	});
}

/**
 * Obtiene el ID numérico asociado a una clave natural (slug, código, etc.) desde un mapa en memoria.
 *
 * Permite resolver claves foráneas (FK) de forma dinámica durante el proceso de seed.
 * A diferencia de un `Map.get()` convencional, lanza una excepción descriptiva si la clave
 * es nula o no se encuentra registrada, evitando insertar valores `undefined` en la base de datos
 * y ayudando a identificar rápidamente typos o referencias rotas en los CSVs.
 *
 * @param map - Diccionario que mapea la clave natural con su ID generado (`Map<string, number>`).
 * @param key - Clave natural a buscar (ej. `_titles_slug`, `_tags_slug`) o `null` si vino vacía.
 * @param context - Información de contexto (ej. `"episodes.csv fila 5"`) para enriquecer el mensaje de error.
 *
 * @returns El ID numérico correspondiente a la clave.
 *
 * @throws {Error} Si la clave es `null` o no existe dentro del mapa.
 *
 * @example
 * ```ts
 * const seriesId = getId(titleIds, row._titles_slug, `episodes.csv: ${row.title}`);
 * ```
 */
export function getId(
	map: Map<string, number>,
	key: string | null,
	context: string,
): number {
	const id = key === null ? undefined : map.get(key);

	if (id === undefined) throw new Error(`No existe "${key}" (${context})`);

	return id;
}

/**
 * Lee un CSV y valida cada fila con un schema de Zod.
 *
 * Es el patrón "leo y valido" de `titles.ts` empaquetado: si una fila no cumple el schema,
 * el error indica archivo y número de línea (+2: una línea de header y las líneas empiezan en 1).
 *
 * @param file - Nombre del archivo dentro de `docs/csv` (ej. `"tags.csv"`).
 * @param schema - Schema Zod de UNA fila, con los nombres de columna del CSV.
 *
 * @returns Las filas ya tipadas por el schema.
 */
export function parseCsv<S extends z.ZodType>(file: string, schema: S): z.output<S>[] {
	return readCsv(file).map((raw, i) => {
		const result = schema.safeParse(raw);

		if (!result.success) {
			throw new Error(`${file} linea ${i + 2}:\n${z.prettifyError(result.error)}`);
		}

		return result.data;
	});
}

// Los CSV son todo texto: estos dos schemas convierten a los tipos que espera Drizzle.

/** "true" / "false" → boolean. No usar `z.coerce.boolean()`: `Boolean("false")` es `true`. */
export const csvBool = z.enum(["true", "false"]).transform((v) => v === "true");

/** "32" → 32 (entero). */
export const csvInt = z.coerce.number().int();
