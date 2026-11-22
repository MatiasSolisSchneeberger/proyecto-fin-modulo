# By Devlights

## Bootcamp 5.0

### MÓDULO NODE.JS TRABAJO PRÁCTICO

# Trabajo práctico integrador: Tu propia API REST

**Entrega final:** sábado 21 de noviembre, 24 hs

---

## Resumen

### Consigna del trabajo práctico

**Modalidad individual**

Vas a construir, de forma individual, una API REST completa sobre una temática a elección, aplicando todo lo visto en las clases 5 a 11. Tenés 2 semanas para entregarla, con un punto de control a mitad de camino.

El objetivo es integrar en un solo proyecto: Node.js con TypeScript, Express, una base de datos (MongoDB o PostgreSQL), arquitectura en capas, autenticación con Bcrypt y JWT, middlewares y manejo de errores. Como cada uno elige un dominio distinto al e-Commerce de la guía práctica, no alcanza con copiar el ejemplo: vas a tener que diseñar tus propios modelos, rutas y validaciones.

---

## Temáticas para elegir

Todas tienen la misma complejidad: una entidad principal más el modelo de usuarios. Elegí una de la lista o proponé la tuya: en ese caso, tiene que tener una complejidad equivalente y contar con la aprobación del docente.

| TEMÁTICA                  | ENTIDAD PRINCIPAL | CAMPOS SUGERIDOS                                        |
| :------------------------ | :---------------- | :------------------------------------------------------ |
| **Biblioteca**            | Libro             | título, autor, año, género, disponible                  |
| **Gimnasio**              | Clase             | nombre, instructor, horario, cupo                       |
| **Recetario**             | Receta            | nombre, ingredientes, tiempo de preparación, dificultad |
| **Turnos médicos**        | Turno             | paciente, especialidad, fecha, estado                   |
| **Lista de tareas**       | Tarea             | título, prioridad, fecha límite, completada             |
| **Catálogo de películas** | Película          | título, director, género, puntaje                       |

---

## Requisitos mínimos

Para aprobar, la API debe cumplir los 10 puntos:

1. **Proyecto con Node.js, Express y TypeScript**, organizado con la estructura por componentes.
2. **Base de datos a elección:** MongoDB Atlas con Mongoose, o PostgreSQL con un ORM (por ejemplo, Sequelize). En los dos casos, con dos modelos: `User` y la entidad elegida.
3. **CRUD completo de la entidad:** GET (todos), GET (por id), POST, PUT y DELETE.
4. **Arquitectura en capas:** rutas, controlador, servicio y acceso a datos.
5. **Al menos 2 validaciones de negocio** en la capa de servicio (por ejemplo, "el cupo no puede ser negativo" o "el puntaje va de 1 a 10").
6. **Registro y login** con Bcrypt y JWT.
7. **Las rutas que crean, modifican o eliminan**, protegidas con un middleware que verifique el JWT.
8. **Códigos de estado correctos** en cada caso: 200, 201, 400, 401, 404 y 500.
9. **Todos los controladores con `try/catch`.**
10. **Secretos en variables de entorno:** la cadena de conexión a la base (`MONGO_URI` o `DATABASE_URL`) y `JWT_SECRET` se leen de un archivo `.env` (con el paquete `dotenv`), ese archivo está en el `.gitignore` y el repositorio incluye un `.env.example` con los nombres de las variables, sin los valores.

---

## Extras opcionales

Suman puntos sobre la nota base (ver rúbrica). Podés elegir cuáles hacer:

- **Filtros con `req.query`:** por ejemplo, `GET /api/books?genre=terror`.
- **Roles:** que solo un usuario admin pueda eliminar.
- **Relación entre modelos:** por ejemplo, cada tarea pertenece al usuario que la creó y cada uno ve solo las suyas.
- **Middleware de logging:** que muestre en la consola el método y la URL de cada petición.

---

## Qué tenés que entregar

- **Repositorio de GitHub** con el código y un README que explique cómo instalar y ejecutar el proyecto, y que liste todos los endpoints.
- **Pruebas en Thunder Client:** la colección exportada o capturas de cada endpoint funcionando, incluidos los casos de error (400, 401, 404).

---

## Plazos y punto de control

El trabajo dura 2 semanas desde que se presenta la consigna, sin extensión. La entrega final es el sábado 21 de noviembre a las 24 hs.

| MOMENTO                                           | QUÉ SE ESPERA                                                                              |
| :------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| **Día 1**                                         | Presentación de la consigna y elección de la temática                                      |
| **Fin de la semana 1 (punto de control)**         | Proyecto creado, conexión a la base de datos y CRUD funcionando, todavía sin autenticación |
| **Sábado 21 de noviembre, 24 hs (entrega final)** | Autenticación, rutas protegidas, validaciones, README y pruebas                            |

En el punto de control vas a recibir una devolución sobre tu avance, antes de sumar la autenticación.

---

## Rúbrica de evaluación

La nota base es sobre 100 puntos; se aprueba con 60. Los extras suman hasta 10 puntos adicionales.

| CRITERIO                    | QUÉ SE EVALÚA                                                                                                                          | PUNTOS  |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| **Estructura y capas**      | Carpetas por componentes; rutas, controlador, servicio y acceso a datos separados                                                      |   20    |
| **CRUD**                    | Los 5 endpoints de la entidad funcionan contra la base de datos elegida                                                                |   20    |
| **Validaciones y errores**  | 2 o más validaciones en el servicio, try/catch en todos los controladores, códigos de estado correctos                                 |   20    |
| **Autenticación**           | Registro con Bcrypt, login con JWT, rutas protegidas con middleware, sin datos sensibles en el token, secretos en variables de entorno |   25    |
| **Documentación y pruebas** | README claro con los endpoints; pruebas en Thunder Client, incluidos los errores                                                       |   15    |
| **Total**                   |                                                                                                                                        | **100** |
| **Extras (opcional)**       | Filtros, roles, relación entre modelos o logging: 2,5 puntos cada uno                                                                  | **+10** |

---

## Resumen de condiciones

| CONDICIÓN                | DETALLE                                                                                                      |
| :----------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Modalidad**            | Individual                                                                                                   |
| **Plazo**                | Entrega final el sábado 21 de noviembre a las 24 hs, sin extensión; punto de control al final de la semana 1 |
| **Aprobación**           | 60 puntos sobre 100 (ver rúbrica)                                                                            |
| **Temática**             | De la lista o propuesta por vos, con aprobación del docente                                                  |
| **Base de datos**        | A elección: MongoDB o PostgreSQL                                                                             |
| **Variables de entorno** | Obligatorias (requisito 10)                                                                                  |
