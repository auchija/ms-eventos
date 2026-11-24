# ms-auditorios · Contrato de la API

Microservicio **proveedor** del examen del Módulo 3 (solo lectura). Puerto: **3012**.
Lo consulta el microservicio de eventos, que guarda el atributo `auditorio_id`.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior, MySQL 8 y ms-usuarios corriendo (para obtener tokens).

1. Como root en MySQL:

```sql
CREATE DATABASE auditorios_db;
CREATE USER 'auditorios_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON auditorios_db.* TO 'auditorios_user'@'localhost';
```

2. `mysql -u auditorios_user -p auditorios_db` y luego `SOURCE db/schema.sql;`
3. `npm install`
4. Copiar `.env.example` como `.env`. `JWT_SECRET` debe ser **la misma de ms-usuarios**.
5. `npm run dev`

## Representación

```json
{"id": 1, "nombre_auditorio": "Auditorio Mayor", "sede": "Valle del Lili", "aforo": 400}
```

## Atributos

| Atributo | Tipo |
|---|---|
| id | entero |
| nombre_auditorio | texto |
| sede | texto |
| aforo | entero |

## Endpoints

Todas las peticiones llevan `Authorization: Bearer <token>`. Cualquier rol autenticado puede consultar.

| Operación | Método | URI | Respuesta exitosa | Errores |
|---|---|---|---|---|
| Listar | GET | /auditorios | 200 arreglo | 401 |
| Consultar por lotes | GET | /auditorios?ids=1,3 | 200 arreglo (solo los que existen) | 400 · 401 |
| Obtener | GET | /auditorios/:id | 200 objeto | 400 · 401 · 404 |

## Datos iniciales

| id | nombre_auditorio | sede | aforo |
|---|---|---|---|
| 1 | Auditorio Mayor | Valle del Lili | 400 |
| 2 | Sala Múltiple | Valle del Lili | 120 |
| 3 | Auditorio Norte | Centro | 80 |
| 4 | Teatrino | Centro | 50 |

## Para el consumidor

La carpeta `para-el-consumidor/` trae `auditorios.client.js` con la función `pedir()` ya escrita (token y tiempo de espera). Se copia en `ms-eventos/src/clients/` y se completa.

## Frontend del examen

La carpeta `frontend/` trae `index.html`, ya configurado para ms-eventos y ms-auditorios. No se modifica: se copia al `DocumentRoot` del host virtual del examen en servidor2, y desde Windows se abre `http://examen.<dominio>/`. La página inicia sesión por `/api/usuarios/login` y muestra los listados de `/api/eventos` y `/api/auditorios` por el mismo nombre, así que no necesita CORS.

## Me consultan

| Me consulta | Peticiones que me hace |
|---|---|
| ms-eventos | `GET /auditorios/:id` (validar) · `GET /auditorios?ids=…` (componer) |
