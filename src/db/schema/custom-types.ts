import { customType } from "drizzle-orm/pg-core";

// text con collation "C": compara byte a byte. Necesario para Fractional Indexing
// (base62: 0-9A-Za-z); con la collation por defecto "a" puede ordenar antes que "B".
export const textC = customType<{ data: string }>({
	dataType() {
		return 'text COLLATE "C"';
	},
});
