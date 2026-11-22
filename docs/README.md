# Carpeta `docs/`

Documentación y datos del proyecto. La guía para instalar y usar la API está en el [README principal](../README.md).

| Carpeta | Qué contiene |
| --- | --- |
| [`consigna/`](consigna/) | Consigna del trabajo práctico integrador (`.md` y `.pdf`) |
| [`producto/`](producto/) | Especificación del producto (PRD) y material de referencia del UCM: guía de orden de visualización y listados (`mcu.csv`, `mcu.pdf`) |
| [`base-de-datos/`](base-de-datos/) | Diagrama del modelo de datos en DBML (`schema.dbml`, se puede abrir en [dbdiagram.io](https://dbdiagram.io)) |
| [`csv/`](csv/) | **Datos que carga `npm run db:seed`.** No mover ni renombrar: el seed los lee de `docs/csv/` (`src/db/seeders/csv.ts`) |
| [`capturas/`](capturas/) | Capturas de pruebas (por ejemplo el caso 500 con la base apagada) |
| [`archivo/`](archivo/) | Material anterior que ya no se usa: la lista de endpoints de Postman (reemplazada por el README) y los CSV del modelo viejo (`tables/`) |
