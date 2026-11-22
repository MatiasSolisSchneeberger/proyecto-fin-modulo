# Endpoints para probar en Postman

Variable sugerida en Postman: `{{baseUrl}}` = `http://localhost:3000/api/v1`

Marcá `[x]` en **check** cuando lo hayas probado y ande bien.

---

## ✅ Existentes (ya implementados)

| num | metodo | url                                                                | datos esperados                                                                       | check |
| --- | ------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ----- |
| 1   | GET    | `{{baseUrl}}/health`                                               | Sin params. 200 → estado de la API/DB                                                 | [ ]   |
| 2   | GET    | `{{baseUrl}}/universes`                                            | Sin params. 200 → lista de universos                                                  | [ ]   |
| 3   | GET    | `{{baseUrl}}/universes?q=earth`                                    | Query `q` (1–100 chars, filtro por texto). 200 → lista filtrada                       | [ ]   |
| 4   | GET    | `{{baseUrl}}/universes/earth-616`                                  | Path `code` (`A-Za-z0-9_-`, máx 50). 200 → universo (ajustá el code a uno de tu seed) | [ ]   |
| 5   | GET    | `{{baseUrl}}/universes/no-existe`                                  | 404 → error de not found                                                              | [ ]   |
| 6   | GET    | `{{baseUrl}}/universes/***`                                        | code inválido. 400 → error de validación                                              | [ ]   |
| 7   | GET    | `{{baseUrl}}/titles`                                               | Sin params. 200 → página 1, limit 20, sort `releaseDate`, solo canon                  | [ ]   |
| 8   | GET    | `{{baseUrl}}/titles?q=iron`                                        | `q` (1–100). 200 → títulos que matchean                                               | [ ]   |
| 9   | GET    | `{{baseUrl}}/titles?kind=movie`                                    | `kind` = valor del enum `titleKind` (ej: movie, series…). 200                         | [ ]   |
| 10  | GET    | `{{baseUrl}}/titles?releasedFrom=2008-01-01&releasedTo=2012-12-31` | Fechas `YYYY-MM-DD`. 200 → filtradas por rango                                        | [ ]   |
| 11  | GET    | `{{baseUrl}}/titles?includeNonCanon=true`                          | `true` / `false`. 200 → incluye no canon                                              | [ ]   |
| 12  | GET    | `{{baseUrl}}/titles?sort=-title`                                   | `title`, `-title`, `releaseDate`, `-releaseDate`, `createdAt`, `-createdAt`. 200      | [ ]   |
| 13  | GET    | `{{baseUrl}}/titles?page=2&limit=5`                                | `page` ≥ 1, `limit` 1–100. 200 → página 2 de 5 items                                  | [ ]   |
| 14  | GET    | `{{baseUrl}}/titles?limit=500`                                     | limit fuera de rango. 400 → validación                                                | [ ]   |
| 15  | GET    | `{{baseUrl}}/titles?releasedFrom=01-01-2008`                       | Fecha mal formateada. 400 → "Formato esperado: YYYY-MM-DD"                            | [ ]   |
| 16  | GET    | `{{baseUrl}}/titles?sort=password`                                 | sort fuera de lista blanca. 400                                                       | [ ]   |
| 17  | GET    | `{{baseUrl}}/titles/1`                                             | Path `id` entero positivo. 200 → detalle del título                                   | [ ]   |
| 18  | GET    | `{{baseUrl}}/titles/999999`                                        | 404 → not found                                                                       | [ ]   |
| 19  | GET    | `{{baseUrl}}/titles/abc`                                           | id no numérico. 400 → validación                                                      | [ ]   |
| 20  | GET    | `{{baseUrl}}/titles/-1`                                            | id negativo. 400 → validación                                                         | [ ]   |
| 21  | GET    | `{{baseUrl}}/ruta-inexistente`                                     | 404 → handler `notFound`                                                              | [ ]   |

---

## 🚧 Pendientes (inferidos del schema de la DB, aún sin implementar)

### Catálogos (solo lectura)

| num | metodo | url                          | datos esperados                                       | check |
| --- | ------ | ---------------------------- | ----------------------------------------------------- | ----- |
| 22  | GET    | `{{baseUrl}}/studios`        | Lista de `production_studios` (id, name, description) | [ ]   |
| 23  | GET    | `{{baseUrl}}/studios/:id`    | Path `id`. Detalle de estudio                         | [ ]   |
| 24  | GET    | `{{baseUrl}}/platforms`      | Lista de `platforms` (id, name, websiteUrl)           | [ ]   |
| 25  | GET    | `{{baseUrl}}/platforms/:id`  | Path `id`. Detalle de plataforma                      | [ ]   |
| 26  | GET    | `{{baseUrl}}/tag-categories` | Lista de `tag_categories` (id, name, description)     | [ ]   |
| 27  | GET    | `{{baseUrl}}/tags`           | Lista de tags. Query opcional: `categoryId`, `q`      | [ ]   |
| 28  | GET    | `{{baseUrl}}/tags/:slug`     | Path `slug`. Detalle de tag                           | [ ]   |

### Títulos (relaciones)

| num | metodo | url                               | datos esperados                       | check |
| --- | ------ | --------------------------------- | ------------------------------------- | ----- |
| 29  | GET    | `{{baseUrl}}/titles/:id/episodes` | Episodios del título (series)         | [ ]   |
| 30  | GET    | `{{baseUrl}}/titles/:id/editions` | Ediciones (extended cut, etc.)        | [ ]   |
| 31  | GET    | `{{baseUrl}}/titles/:id/items`    | Items de timeline asociados al título | [ ]   |

### Timeline (items y órdenes)

| num | metodo | url                                    | datos esperados                                                                    | check |
| --- | ------ | -------------------------------------- | ---------------------------------------------------------------------------------- | ----- |
| 32  | GET    | `{{baseUrl}}/timelines`                | Lista de timelines (id, slug, name, description, isDefault)                        | [ ]   |
| 33  | GET    | `{{baseUrl}}/timelines/:slug`          | Path `slug` (ej: `chronological`, `release`). Detalle                              | [ ]   |
| 34  | GET    | `{{baseUrl}}/timelines/:slug/entries`  | Items ordenados por `orderKey`. Query opcional: `universe`, `page`, `limit`        | [ ]   |
| 35  | GET    | `{{baseUrl}}/timeline-items`           | Query: `universe`, `segment`, `titleId`, `page`, `limit`                           | [ ]   |
| 36  | GET    | `{{baseUrl}}/timeline-items/:id`       | Path `id`. Detalle del item                                                        | [ ]   |
| 37  | GET    | `{{baseUrl}}/timeline-items/:id/notes` | Notas del item (content, isSpoiler, orderIndex). Query opcional: `includeSpoilers` | [ ]   |

### Auth

| num | metodo | url                         | datos esperados                                                                                                       | check |
| --- | ------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----- |
| 38  | POST   | `{{baseUrl}}/auth/register` | Body JSON: `{ "username": "string(≤50)", "email": "string(≤255)", "password": "string" }`. 201 → usuario sin password | [ ]   |
| 39  | POST   | `{{baseUrl}}/auth/register` | Mismo body con username/email repetido. 409 → conflicto                                                               | [ ]   |
| 40  | POST   | `{{baseUrl}}/auth/login`    | Body JSON: `{ "email": "...", "password": "..." }`. 200 → `{ token }` (JWT)                                           | [ ]   |
| 41  | POST   | `{{baseUrl}}/auth/login`    | Credenciales incorrectas. 401                                                                                         | [ ]   |
| 42  | GET    | `{{baseUrl}}/users/me`      | Header `Authorization: Bearer <token>`. 200 → perfil (id, username, email, role)                                      | [ ]   |
| 43  | GET    | `{{baseUrl}}/users/me`      | Sin token. 401                                                                                                        | [ ]   |

### Progreso de visionado (requiere token)

| num | metodo | url                                     | datos esperados                                                                                 | check |
| --- | ------ | --------------------------------------- | ----------------------------------------------------------------------------------------------- | ----- |
| 44  | GET    | `{{baseUrl}}/users/me/progress`         | Header Bearer. Query opcional: `status`, `timeline`, `page`, `limit`. 200 → items vistos        | [ ]   |
| 45  | PUT    | `{{baseUrl}}/users/me/progress/:itemId` | Header Bearer. Body: `{ "status": "watched" }` (valor del enum `watchStatus`). 200/201 → upsert | [ ]   |
| 46  | DELETE | `{{baseUrl}}/users/me/progress/:itemId` | Header Bearer. 204 → vuelve a "pendiente"                                                       | [ ]   |
| 47  | GET    | `{{baseUrl}}/users/me/progress/summary` | Header Bearer. 200 → totales (vistos/total, minutos vistos)                                     | [ ]   |
| 48  | GET    | `{{baseUrl}}/users/me/progress/next`    | Header Bearer. Query opcional: `timeline`. 200 → próximo item sin ver                           | [ ]   |

### Administración (rol `admin`, requiere token)

| num | metodo | url                      | datos esperados                                                           | check |
| --- | ------ | ------------------------ | ------------------------------------------------------------------------- | ----- |
| 49  | POST   | `{{baseUrl}}/titles`     | Bearer admin. Body: datos del título (title, kind, releaseDate, ...). 201 | [ ]   |
| 50  | PATCH  | `{{baseUrl}}/titles/:id` | Bearer admin. Body parcial. 200                                           | [ ]   |
| 51  | DELETE | `{{baseUrl}}/titles/:id` | Bearer admin. 204                                                         | [ ]   |
| 52  | POST   | `{{baseUrl}}/titles`     | Bearer de usuario normal. 403                                             | [ ]   |

---

> Los endpoints **22–52** son una propuesta basada en las tablas del schema (`catalogs`, `titles`, `timeline`, `users`); los paths y nombres de campos pueden cambiar cuando los implementes. Los valores de ejemplo (`earth-616`, `kind=movie`) conviene ajustarlos a lo que tengas en tu seed.
