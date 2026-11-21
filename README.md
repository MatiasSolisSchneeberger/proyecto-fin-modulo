# API REST · Cronología del Universo Cinematográfico de Marvel

API REST para consultar la **línea temporal del UCM** (películas, series, especiales y sus escenas post-créditos) y llevar el **seguimiento personal** de lo que cada usuario va viendo.

- La entidad del CRUD de la consigna es **`titles`** (obras): cualquiera puede consultarlas; solo el **admin** crea, edita y borra.
- Cada usuario registrado marca ítems como `watched` o `skipped` en `/me/progress` y solo ve **lo suyo**.
- Datos reales: el seed carga las obras, episodios, ediciones, tags y la cronología desde los CSV de `docs/csv/`.

---

## 1. Stack

| Pieza | Uso |
| --- | --- |
| Node.js + TypeScript | Runtime y lenguaje (ESM, `tsx` para desarrollo) |
| Express 5 | Servidor HTTP y routing |
| PostgreSQL 16 (Docker) | Base de datos |
| Drizzle ORM + drizzle-kit | Schema, migraciones y queries |
| Zod 4 | Validación de params, query y body |
| bcrypt | Hash de contraseñas |
| jsonwebtoken | Autenticación con JWT |

---

## 2. Instalación paso a paso

Requisitos: **Node.js** (probado con v24) y **Docker**.

```bash
# 1) Dependencias
npm install

# 2) Variables de entorno
cp .env.example .env        # en PowerShell: Copy-Item .env.example .env
#    ...y completar los valores (ver tabla de abajo)

# 3) Base de datos en Docker
docker compose up -d

# 4) Crear las tablas
npm run db:migrate

# 5) Cargar los datos (catálogo, cronología y usuario admin)
npm run db:seed

# 6) Levantar la API
npm run dev
```

Verificar que funciona: <http://localhost:3000/api/v1/health> debe responder `{ "data": { "status": "ok", "db": "ok", ... } }`.

> ⚠️ `npm run db:seed` **vacía** las tablas del catálogo (y, en cascada, el progreso de los usuarios) antes de cargar. Es solo para desarrollo.

### Variables de entorno (`.env`)

| Variable | Para qué sirve |
| --- | --- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Credenciales y nombre de la base. Las usa `docker-compose.yml` para crear el contenedor |
| `DB_HOST`, `DB_PORT` | Dónde corre Postgres (`localhost` y el puerto que publiques, ej. `5432`) |
| `DATABASE_URL` | Cadena de conexión. Ya viene armada con las variables anteriores (`${DB_USER}`…): no hace falta tocarla |
| `JWT_SECRET` | Secreto para firmar los tokens. **Mínimo 16 caracteres**; usá uno largo y aleatorio |
| `JWT_EXPIRES_IN` | Duración del token (ej. `1h`). Si no se define, `1h` |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Datos del admin que crea el seed (`ADMIN_PASSWORD`: 8 a 72 caracteres). La API arranca aunque estén vacías, pero no habrá admin |
| `PORT` | Puerto de la API (opcional, default `3000`) |

El `.env` **no se versiona**: solo `.env.example`, sin valores.

---

## 3. Estructura del proyecto

```
src/
├── app.ts                  # arma la app: logger → JSON → rutas → 404 → errores
├── index.ts                # arranca el servidor
├── config/                 # carga y valida las variables de entorno (Zod)
├── db/
│   ├── schema/             # tablas y enums de Drizzle
│   ├── seeders/            # carga de datos desde docs/csv
│   └── seed.ts
└── api/
    ├── routers/index.ts    # monta cada componente bajo /api/v1
    ├── middleware/         # logger, requireAuth/requireRole, 404, error handler
    ├── errors/app-error.ts # clases de error con status y código
    └── components/<recurso>/
        ├── routes.ts       # URL → controller (+ middlewares de auth)
        ├── controller.ts   # HTTP ↔ service: valida con Zod y arma la respuesta
        ├── service.ts      # reglas de negocio y errores
        ├── repository.ts   # única capa que habla con la base (Drizzle)
        └── schema.ts       # validaciones Zod
```

Componentes: `health`, `auth`, `titles`, `universes`, `studios`, `platforms`, `tag-categories`, `tags`, `progress`.

**Capas** (una request las atraviesa en este orden): `routes` → `controller` → `service` → `repository`. Cada capa solo conoce a la siguiente: el controller no toca la base y el repository no sabe nada de HTTP.

---

## 4. Autenticación

1. **Registrarse:** `POST /api/v1/auth/register` con `{ "username", "email", "password" }` → crea un usuario con rol `user`.
2. **Loguearse:** `POST /api/v1/auth/login` con `{ "email", "password" }` → devuelve `{ "data": { "token": "..." } }`.
3. **Usar el token** en las rutas protegidas:

   ```
   Authorization: Bearer <token>
   ```

- La contraseña se guarda con **bcrypt** y **nunca** aparece en ninguna respuesta.
- El token (JWT) lleva solo `sub` (id del usuario) y `role` (`user` | `admin`). Expira según `JWT_EXPIRES_IN`.
- Login con email inexistente o clave incorrecta responde lo mismo (`INVALID_CREDENTIALS`), para no revelar cuál falló.
- **Admin:** no se puede crear por la API (el registro siempre da `user`). Lo crea `npm run db:seed` con los `ADMIN_*` del `.env`.

---

## 5. Endpoints

Base: `http://localhost:3000/api/v1`. 🔓 = público · 🔑 = requiere token · 👑 = requiere token de admin.

### Salud y autenticación

| Método | Ruta | Acceso | Body / query | Respuestas |
| --- | --- | :-: | --- | --- |
| GET | `/health` | 🔓 | – | 200, 503 `DB_UNAVAILABLE` |
| POST | `/auth/register` | 🔓 | body: `username` (3–50), `email`, `password` (8–72) | 201, 400, 409 `EMAIL_TAKEN` / `USERNAME_TAKEN` |
| POST | `/auth/login` | 🔓 | body: `email`, `password` | 200 `{ token }`, 400, 401 `INVALID_CREDENTIALS` |

### Obras (`titles`): el CRUD

| Método | Ruta | Acceso | Body / query | Respuestas |
| --- | --- | :-: | --- | --- |
| GET | `/titles` | 🔓 | query: `q`, `kind`, `releasedFrom`, `releasedTo`, `includeNonCanon`, `sort`, `page`, `limit` | 200 `{ data, meta }`, 400 |
| GET | `/titles/:id` | 🔓 | – | 200, 400, 404 `TITLE_NOT_FOUND` |
| POST | `/titles` | 👑 | body: `kind`, `title`, `releaseDate` (YYYY-MM-DD), `slug?`, `posterUrl?`, `synopsis?`, `isCanon?` | 201, 400, 401, 403, 409 `TITLE_SLUG_TAKEN` |
| PUT | `/titles/:id` | 👑 | body: cualquier campo de arriba (al menos uno) | 200, 400, 401, 403, 404, 409 |
| DELETE | `/titles/:id` | 👑 | – | 204, 400, 401, 403, 404 |

Query de `GET /titles`:

| Parámetro | Valores | Default |
| --- | --- | --- |
| `q` | texto a buscar en el título (1–100) | – |
| `kind` | `movie`, `series`, `short`, `special` | – |
| `releasedFrom`, `releasedTo` | fecha `YYYY-MM-DD` | – |
| `includeNonCanon` | `true` / `false` | `false` (se ocultan las obras no canon) |
| `sort` | `title`, `releaseDate`, `createdAt` (con `-` adelante = descendente) | `releaseDate` |
| `page`, `limit` | entero ≥ 1 / 1 a 100 | `1` / `20` |

### Progreso del usuario (`/me/progress`): todas 🔑

Cada usuario solo ve y modifica **su** progreso: el usuario sale siempre del token, nunca de la URL ni del body.

| Método | Ruta | Body / query | Respuestas |
| --- | --- | --- | --- |
| GET | `/me/progress` | query: `status` (`watched` \| `skipped`), `page`, `limit` | 200 `{ data, meta }`, 400, 401 |
| PUT | `/me/progress/:itemId` | body opcional: `status` (default `watched`), `watchedAt` (ISO 8601 con zona, default ahora) | 200, 400, 401, 404 `ITEM_NOT_FOUND` |
| DELETE | `/me/progress/:itemId` | – | 204 (también si no estaba marcado), 400, 401, 404 `ITEM_NOT_FOUND` |

Cada elemento de la respuesta incluye el ítem con su obra, y el episodio o la edición cuando corresponde:

```json
{
  "itemId": 87,
  "status": "watched",
  "watchedAt": "2026-11-21T20:00:00.000Z",
  "item": {
    "id": 87,
    "label": null,
    "segment": "episode",
    "durationMinutes": 52,
    "title": { "id": 12, "title": "Loki", "slug": "loki" },
    "episode": { "seasonNumber": 1, "episodeNumber": 3, "title": "Lamentis" },
    "edition": null
  }
}
```

`segment` distingue las partes de una misma obra (`full`, `main`, `post_credits`, `bonus`, `episode`): marcar el cuerpo principal de una película **no** marca su escena post-créditos, son ítems separados.

### Catálogos (solo lectura, 🔓)

| Método | Ruta | Query | Respuestas |
| --- | --- | --- | --- |
| GET | `/universes` | `q` | 200 |
| GET | `/universes/:code` | – | 200, 404 `UNIVERSE_NOT_FOUND` |
| GET | `/studios` | `q` | 200 |
| GET | `/studios/:id` | – | 200, 400, 404 `STUDIO_NOT_FOUND` |
| GET | `/platforms` | `q` | 200 |
| GET | `/platforms/:id` | – | 200, 400, 404 `PLATFORM_NOT_FOUND` |
| GET | `/tag-categories` | – | 200 |
| GET | `/tags` | `q`, `categoryId` | 200, 400 |
| GET | `/tags/:slug` | – | 200, 404 `TAG_NOT_FOUND` |

---

## 6. Formato de respuesta y códigos de estado

**Éxito:** `{ "data": ... }`, o `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }` en listados paginados. `204` no lleva body.

**Error:** siempre la misma forma.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Hay errores de validación",
    "details": [{ "field": "releaseDate", "message": "Formato esperado: YYYY-MM-DD" }]
  }
}
```

`details` solo aparece en errores de validación.

| Código | Cuándo | `error.code` típico |
| --- | --- | --- |
| 200 | Consulta o actualización correcta | – |
| 201 | Recurso creado | – |
| 204 | Borrado correcto, sin body | – |
| 400 | Params, query o body inválidos; JSON mal formado; regla de negocio | `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_RELEASE_DATE`, `INVALID_WATCHED_AT` |
| 401 | Falta el token, es inválido o expiró; credenciales incorrectas | `MISSING_TOKEN`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` |
| 403 | Token válido pero sin el rol necesario (usuario común en una ruta de admin) | `FORBIDDEN` |
| 404 | El recurso o la ruta no existen | `TITLE_NOT_FOUND`, `ITEM_NOT_FOUND`, `ROUTE_NOT_FOUND`… |
| 409 | Conflicto con datos existentes | `TITLE_SLUG_TAKEN`, `EMAIL_TAKEN`, `USERNAME_TAKEN` |
| 500 | Error inesperado. El detalle va al log del servidor, **nunca** a la respuesta | `INTERNAL_ERROR` |
| 503 | La base de datos no responde (solo `/health`) | `DB_UNAVAILABLE` |

---

## 7. Reglas de negocio

- **Fecha de estreno** (`releaseDate`): entre `1900-01-01` y hoy + 10 años (`INVALID_RELEASE_DATE`).
- **Slug único:** si no se envía, se genera desde el título (`"Iron Man 3!"` → `iron-man-3`). Repetido → 409 `TITLE_SLUG_TAKEN`.
- **Obras no canon:** se ocultan por defecto; se muestran con `includeNonCanon=true`.
- **Progreso:** el ítem tiene que existir (`ITEM_NOT_FOUND`) y `watchedAt` no puede estar en el futuro (`INVALID_WATCHED_AT`). Un ítem sin fila de progreso se considera pendiente.
- **Permisos:** solo el admin escribe en el catálogo; cada usuario solo escribe y lee su propio progreso.
- **Email y username únicos** (el email sin distinguir mayúsculas).

---

## 8. Extras implementados

**Filtros y ordenamiento** (`/titles`):

```
GET /api/v1/titles?q=iron&kind=movie&releasedFrom=2008-01-01&sort=-releaseDate&page=1&limit=10
```

**Roles** (`user` / `admin`): un usuario común que intenta crear una obra recibe 403.

```
POST /api/v1/titles        Authorization: Bearer <token de user>   →  403 FORBIDDEN
POST /api/v1/titles        Authorization: Bearer <token de admin>  →  201
```

**Logging:** cada request se imprime en la consola del servidor con método, URL, status y duración.

```
GET /api/v1/titles?kind=movie 200 12ms
POST /api/v1/titles 401 2ms
```

**Relación entre modelos:** `users` ↔ `timeline_items` mediante `user_watch_progress` (PK `userId + itemId`). `GET /me/progress` devuelve solo los ítems del usuario del token, con su obra, episodio y edición.

---

## 9. Pruebas

Las pruebas manuales se hicieron con **Postman**. La colección está en `postman/collections/` (una carpeta por recurso: `auth`, `titles`, `me-progress`, `misc`, catálogos…) y usa el environment `postman/environments/Environment.environment.yaml` (`baseUrl`, `token`, `adminToken`).

Cubre, para cada endpoint del CRUD y de `/me/progress`: el caso feliz (200/201/204) y los errores **400** (validación), **401** (sin token, token inválido, sin `Bearer`), **403** (usuario sin rol admin), **404** e idempotencia del `DELETE`. Cada request lleva su `pm.test` de status.

Para correrla: importar la carpeta `postman/` en Postman, cargar las credenciales en el environment, hacer login con un usuario y con el admin para guardar `token` y `adminToken`, y usar el **Runner**.

El **500** no se puede provocar desde Postman: se probó apagando el contenedor (`docker stop mcu-chronological-order`) y llamando a `GET /titles`. Responde `500 INTERNAL_ERROR` sin stack trace.

Capturas de las pruebas: carpeta [`docs/capturas/`](docs/capturas/).
