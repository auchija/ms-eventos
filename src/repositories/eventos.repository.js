// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) — versión MySQL
// Única capa que sabe DÓNDE y CÓMO se guardan los datos (SQL).
// Devuelve objetos o null; nunca lanza errores HTTP (eso es del servicio).
// =====================================================================
const pool = require('../db');

// GET /eventos y GET /eventos?tipo=taller
async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM eventos';
  const condiciones = [];
  const valores = [];
  if (filtros.tipo !== undefined) {
    condiciones.push('tipo = ?');
    valores.push(filtros.tipo);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM eventos WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

// Para la regla de unicidad (409)
async function findByCodigo(codigo) {
  const [filas] = await pool.query('SELECT * FROM eventos WHERE codigo = ?', [codigo]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(evento) {
  const [resultado] = await pool.query(
    'INSERT INTO eventos (codigo, nombre, fecha, asistentes_esperados, tipo, auditorio_id) VALUES (?, ?, ?, ?, ?, ?)',
    [evento.codigo, evento.nombre, evento.fecha, evento.asistentes_esperados, evento.tipo, evento.auditorio_id]);
  return findById(resultado.insertId);    
}

// Reemplaza el evento completo (PUT). Devuelve el evento actualizado o null si no existe.
async function update(id, evento) {
  const [resultado] = await pool.query(
    'UPDATE eventos SET codigo = ?, nombre = ?, fecha = ?, asistentes_esperados = ?, tipo = ? WHERE id = ?',
    [evento.codigo, evento.nombre, evento.fecha, evento.asistentes_esperados, evento.tipo, id]);
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

// Devuelve true si lo eliminó, false si no existía
async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByCodigo, create, update, remove };
