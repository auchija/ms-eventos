# ms-eventos · Contrato de la API

Microservicio de **eventos** (conferencias, talleres y ferias). Evaluación del Módulo 3 · Redes y Servicios Multimedia · UAO.

**Puerto:** 3011 (escucha en 127.0.0.1). **Base de datos:** `eventos_db`.

## Integrantes

| Integrante | Usuario de GitHub |
|---|---|
| Alejandro González | auchija |
| Miguel Ángel Jiménez | Chanclaxx |

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL 8.

1. Crear la base de datos y su usuario (como root en MySQL Workbench):

```sql
CREATE DATABASE eventos_db;
CREATE USER 'eventos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON eventos_db.* TO 'eventos_user'@'localhost';
```

2. Crear la tabla y los registros iniciales: en Workbench abrir `db/schema.sql`, seleccionar `eventos_db` (doble clic en *Schemas*) y ejecutarlo. En consola: `mysql -u eventos_user -p eventos_db < db/schema.sql`.
3. `npm install`
4. Copiar `.env.example` como `.env` y poner la contraseña de `eventos_user` en `DB_PASSWORD` y en `JWT_SECRET` **la misma clave del .env de ms-usuarios**.
5. `npm run dev`

Debe estar corriendo también **ms-usuarios** (3001) para obtener el token. Salud: http://localhost:3011/health.

Cada petición queda registrada en la terminal: `2026-11-22T15:04:05.123Z  GET /eventos?tipo=taller → 200`.

### Variables del .env

| Variable | Valor | Para qué |
|---|---|---|
| PORT / HOST | 3011 / 127.0.0.1 | Dónde escucha (solo el mismo equipo: el gateway Apache) |
| DB_HOST / DB_PORT | localhost / 3306 | Servidor MySQL (en servidor2: la IP de servidor1) |
| DB_NAME | eventos_db | Base de datos propia del microservicio |
| DB_USER / DB_PASSWORD | eventos_user / ... | Usuario con permisos solo sobre eventos_db |
| JWT_SECRET | la de ms-usuarios | Verifica la firma de los tokens |

## Representación

`GET /eventos/1`:

```json
{ "id": 1, "codigo": "EV-001", "nombre": "Conferencia de Redes 5G", "fecha": "2026-12-03", "asistentes_esperados": 120, "tipo": "conferencia" }
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna MySQL | Positivo y único |
| codigo | texto | Sí | No vacío, máximo 20 caracteres; **único** (409) |
| nombre | texto | Sí | No vacío, máximo 120 caracteres |
| fecha | texto (fecha) | Sí | Formato `AAAA-MM-DD` y fecha real del calendario |
| asistentes_esperados | entero | Sí | Mayor que 0, máximo 2147483647 |
| tipo | texto | Sí | `conferencia`, `taller` o `feria` |

**Regla de negocio (capa de servicio):** **409** si ya existe otro evento con el mismo `codigo`. Al actualizar, el evento no choca consigo mismo.

## Endpoints

| Operación | Método | URI | Quién | Cuerpo | Éxito | Errores |
|---|---|---|---|---|---|---|
| Salud | GET | /health | Público | — | 200 | — |
| Listar | GET | /eventos | Cualquier rol autenticado | — | 200 arreglo | 401 |
| Filtrar | GET | /eventos?tipo=taller | Cualquier rol autenticado | — | 200 arreglo filtrado | 400 tipo inválido · 401 |
| Obtener | GET | /eventos/:id | Cualquier rol autenticado | — | 200 objeto | 400 id inválido · 401 · 404 |
| Crear | POST | /eventos | administrador | JSON sin id | 201 objeto + `Location` | 400 · 401 · 403 · 409 |
| Actualizar | PUT | /eventos/:id | administrador | JSON completo sin id | 200 objeto | 400 · 401 · 403 · 404 · 409 |
| Eliminar | DELETE | /eventos/:id | administrador | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

Ejemplo `POST /eventos`:

```json
{ "codigo": "EV-004", "nombre": "Feria de Robótica", "fecha": "2027-03-10", "asistentes_esperados": 250, "tipo": "feria" }
```

Respuesta `201 Created` (cabecera `Location: /eventos/4`):

```json
{ "id": 4, "codigo": "EV-004", "nombre": "Feria de Robótica", "fecha": "2027-03-10", "asistentes_esperados": 250, "tipo": "feria" }
```

Formato de error: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en validación). Ejemplos:

```json
{ "error": "Datos inválidos", "detalles": ["asistentes_esperados es obligatorio y debe ser un entero entre 1 y 2147483647"] }
{ "error": "Ya existe un evento con el código EV-001 (evento 1)" }
{ "error": "No existe el evento con id 999" }
{ "error": "Falta el token de acceso (cabecera Authorization: Bearer <token>)" }
{ "error": "El rol medico no tiene permiso para esta operación" }
```

## Seguridad

Todas las rutas de `/eventos` exigen `Authorization: Bearer <token>` (obtenido con `POST /usuarios/login` de ms-usuarios). El token se verifica con `JWT_SECRET` en `src/middlewares/auth.js` (copiado sin cambios de ms-usuarios).

- **401:** falta el token, es inválido o venció.
- **403:** el rol no tiene permiso. Consultan todos los roles; crean, modifican y eliminan solo **administrador**.

## Relaciones

Ninguna (no tiene atributos `_id`). La relación con el microservicio proveedor se agrega en el examen.

## Arquitectura

```
src/
├── index.js                      arranque (puerto y host)
├── app.js                        middlewares, registro de peticiones, rutas, errores
├── db.js                         pool de conexiones MySQL
├── routes/eventos.routes.js      URI + método → controlador; token y rol
├── controllers/eventos.controller.js   lee req, responde status + JSON
├── services/eventos.service.js   reglas de negocio: 400, 404, 409
├── repositories/eventos.repository.js  SQL (única capa que toca MySQL)
├── models/evento.js              campos y validación de formato
├── middlewares/auth.js           verificarToken, requiereRol
└── utils/http-error.js           error con código HTTP
```

## Pruebas

Colección de Postman en `docs/ms-eventos.postman_collection.json` (importar y ejecutar con el *Runner*, en orden):

- `00a–00c`: login del administrador, creación del usuario de prueba `medico@medired.com` / `Medico2026*` (201, o 409 si ya existe) y su login. Los tokens se guardan solos.
- `01–19`: casos 200, 201, 204, 400, 401, 403, 404 y 409 de listar, filtrar, obtener, crear, actualizar y eliminar.
- Variables de la colección (pestaña *Variables*):

| Variable | En el PC | A través del gateway (servidor2) |
|---|---|---|
| `base` | `http://localhost:3011` | `http://<host>/api` |
| `usuarios` | `http://localhost:3001` | `http://<host>/api` |
| `admin_email` | `admin@empresa.com` | el del ms-usuarios desplegado |
| `admin_password` | `Admin2026*` | la del ms-usuarios desplegado |
