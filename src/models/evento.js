// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Evento y qué reglas de FORMATO deben cumplir.
// No sabe nada de HTTP ni de bases de datos. Sus errores terminan en 400.
// =====================================================================

// Lista cerrada de tipos permitidos
const TIPOS = ['conferencia', 'taller', 'feria'];

// Formato de fecha: AAAA-MM-DD (ej. 2026-12-03)
const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// Verifica el formato Y que la fecha exista en el calendario (rechaza 2026-02-30)
function esFechaValida(valor) {
  if (typeof valor !== 'string' || !FECHA_VALIDA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

function esTextoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarEvento(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del evento'];
  }
  // La columna es VARCHAR(20): un código más largo debe dar 400, no 500
  if (!esTextoNoVacio(datos.codigo) || datos.codigo.trim().length > 20) {
    errores.push('codigo es obligatorio (texto de máximo 20 caracteres)');
  }
  // La columna es VARCHAR(120): un nombre más largo debe dar 400, no 500
  if (!esTextoNoVacio(datos.nombre) || datos.nombre.trim().length > 120) {
    errores.push('nombre es obligatorio (texto de máximo 120 caracteres)');
  }
  if (!esFechaValida(datos.fecha)) {
    errores.push('fecha es obligatoria con formato AAAA-MM-DD (ej. 2026-12-03)');
  }
  // La columna es INT: su valor máximo es 2147483647
  if (!Number.isInteger(datos.asistentes_esperados) || datos.asistentes_esperados <= 0
      || datos.asistentes_esperados > 2147483647) {
    errores.push('asistentes_esperados es obligatorio y debe ser un entero entre 1 y 2147483647');
  }
  if (!TIPOS.includes(datos.tipo)) {
    errores.push(`tipo debe ser uno de: ${TIPOS.join(', ')}`);
  }
  return errores;
}

// Construye un evento "limpio" solo con los campos permitidos
// (si el cliente manda campos de más, como id, se ignoran)
function construirEvento(datos) {
  return {
    codigo: datos.codigo.trim(),
    nombre: datos.nombre.trim(),
    fecha: datos.fecha,
    asistentes_esperados: datos.asistentes_esperados,
    tipo: datos.tipo,
  };
}

module.exports = { validarEvento, construirEvento, TIPOS };
