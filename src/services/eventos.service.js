// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las validaciones y las reglas del negocio y decide los errores:
// 400 (datos inválidos), 404 (no existe) y 409 (código repetido).
// No sabe nada de HTTP (req/res) ni de SQL: para los datos usa el repositorio.
// =====================================================================
const repo = require('../repositories/eventos.repository');
const { validarEvento, construirEvento } = require('../models/evento');
const HttpError = require('../utils/http-error');
const auditoriosClient = require('../clients/auditorios.client');

// Regla de negocio 409: no puede haber dos eventos con el mismo código.
// excluirId: al actualizar, el evento no choca consigo mismo.
async function validarCodigoUnico(codigo, excluirId = null) {
  const otro = await repo.findByCodigo(codigo);
  if (otro && otro.id !== excluirId) {
    throw new HttpError(409, `Ya existe un evento con el código ${codigo} (evento ${otro.id})`);
  }
}
function validarAforo(evento, auditorio) {
  if (evento.asistentes_esperados > auditorio.aforo) {
    throw new HttpError(400,
      `asistentes_esperados (${evento.asistentes_esperados}) supera el aforo del auditorio ` +
      `${auditorio.id} - ${auditorio.nombre_auditorio} (${auditorio.aforo})`);
  }
}
function resumenAuditorio(a) {
  return { id: a.id, nombre_auditorio: a.nombre_auditorio, sede: a.sede };
}
const AVISO_AUDITORIOS = 'no se pudo obtener el auditorio';
async function componer(eventos, token) {
  if (eventos.length === 0) return eventos;
  const ids = [...new Set(eventos.map((e) => e.auditorio_id))];   // sin repetidos
  const auditorios = await auditoriosClient.obtenerAuditoriosPorIds(ids, token);

  return eventos.map((evento) => {
    if (auditorios === null) {
      return { ...evento, auditorio: null, aviso: AVISO_AUDITORIOS };
    }
    const a = auditorios.find((x) => x.id === evento.auditorio_id);
    return { ...evento, auditorio: a ? resumenAuditorio(a) : null };
  });
}
async function listar(filtros, token) {
  const eventos = await repo.findAll(filtros);
  return componer(eventos, token);
}

async function obtener(id, token) {
  const evento = await repo.findById(id);
  if (!evento) throw new HttpError(404, `No existe el evento con id ${id}`);
  const [compuesto] = await componer([evento], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarEvento(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const evento = construirEvento(datos);
  const auditorio = await auditoriosClient.obtenerAuditorio(evento.auditorio_id, token);
  validarAforo(evento, auditorio);
  await validarCodigoUnico(evento.codigo);
   const nuevo = await repo.create(evento);
  return { ...nuevo, auditorio: resumenAuditorio(auditorio) };
}

async function actualizar(id, datos, token) {
  const errores = validarEvento(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  if (!(await repo.findById(id))) throw new HttpError(404, `No existe el evento con id ${id}`);

  const evento = construirEvento(datos);
  const auditorio = await auditoriosClient.obtenerAuditorio(evento.auditorio_id, token);
  validarAforo(evento, auditorio);
  await validarCodigoUnico(evento.codigo, id);
    const actualizado = await repo.update(id, evento);
  return { ...actualizado, auditorio: resumenAuditorio(auditorio) };
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el evento con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
