// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, query, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/eventos.service');
const { TIPOS } = require('../models/evento');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /eventos  ·  filtro opcional: ?tipo=conferencia | taller | feria
async function listar(req, res) {
  const filtros = {};
  if (req.query.tipo !== undefined) {
    if (!TIPOS.includes(req.query.tipo)) {
      throw new HttpError(400, `tipo debe ser uno de: ${TIPOS.join(', ')}`);
    }
    filtros.tipo = req.query.tipo;
  }
    res.status(200).json(await service.listar(filtros, req.headers.authorization));
}

// GET /eventos/:id
async function obtener(req, res) {
    res.status(200).json(await service.obtener(leerId(req), req.headers.authorization));
}

// POST /eventos  ·  201 Created + cabecera Location con la URI del nuevo recurso
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /eventos/:id  ·  reemplaza el evento completo (el cuerpo lleva todos los atributos, sin id)
async function actualizar(req, res) {
  res.status(200).json(await service.actualizar(leerId(req), req.body, req.headers.authorization));
}

// DELETE /eventos/:id  ·  204 No Content: éxito, sin cuerpo
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
