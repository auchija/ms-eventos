-- db/schema.sql · ms-eventos
-- Se ejecuta DENTRO de eventos_db (la base de datos y su usuario se crean antes, como root).
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE eventos (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  codigo                VARCHAR(20)  NOT NULL UNIQUE,   -- regla: código único (el servicio responde 409)
  nombre                VARCHAR(120) NOT NULL,
  fecha                 DATE         NOT NULL,          -- AAAA-MM-DD
  asistentes_esperados  INT          NOT NULL,          -- mayor que 0 (lo valida el modelo)
  tipo                  VARCHAR(20)  NOT NULL,
  auditorio_id          INT          NOT NULL          -- conferencia, taller o feria
) DEFAULT CHARSET = utf8mb4;

-- Registros iniciales (datos ficticios)
INSERT INTO eventos (codigo, nombre, fecha, asistentes_esperados, tipo, auditorio_id) VALUES
  ('EV-001', 'Conferencia de Redes 5G',           '2026-12-03', 120, 'conferencia',1),
  ('EV-002', 'Taller de Microservicios con Node', '2026-12-10',  30, 'taller',2),
  ('EV-003', 'Feria de Emprendimiento UAO',       '2027-02-15', 400, 'feria',1);
