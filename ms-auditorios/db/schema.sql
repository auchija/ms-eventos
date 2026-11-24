-- db/schema.sql — base de datos de ms-auditorios
SET NAMES utf8mb4;

CREATE TABLE auditorios (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  nombre_auditorio     VARCHAR(80) NOT NULL,
  sede                 VARCHAR(60) NOT NULL,
  aforo                INT NOT NULL
);

INSERT INTO auditorios (nombre_auditorio, sede, aforo) VALUES
  ('Auditorio Mayor', 'Valle del Lili', 400),
  ('Sala Múltiple', 'Valle del Lili', 120),
  ('Auditorio Norte', 'Centro', 80),
  ('Teatrino', 'Centro', 50);
