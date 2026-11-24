// =====================================================================
// CLIENTE HTTP de ms-auditorios, para el microservicio de eventos.
// Copie este archivo en ms-eventos/src/clients/ y COMPLÉTELO:
// la función pedir() ya está hecha; faltan las funciones que usan
// la validación, la regla de negocio y la composición.
// En el .env de ms-eventos:  AUDITORIOS_URL=http://127.0.0.1:3012
// =====================================================================
const HttpError = require('../utils/http-error');
const AUDITORIOS_URL = process.env.AUDITORIOS_URL;

// Hace una petición GET a ms-auditorios reenviando el token del usuario.
// Devuelve la respuesta de fetch, o null si ms-auditorios no respondió.
async function pedir(ruta, token) {
  try {
    return await fetch(`${AUDITORIOS_URL}${ruta}`, {
      headers: { Authorization: token },     // el token de la petición original
      signal: AbortSignal.timeout(3000),      // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                              // ms-auditorios caído o sin responder
  }
}
async function obtenerAuditorio(id, token) {
  const respuesta = await pedir(`/auditorios/${id}`, token);
  if (!respuesta) {
    throw new HttpError(503, 'ms-auditorios no responde: no se pudo validar el auditorio');
  }
  if (respuesta.status === 404) {
    throw new HttpError(400, `No existe el auditorio con id ${id} en ms-auditorios`);
  }
  if (!respuesta.ok) {
    throw new HttpError(502, `ms-auditorios respondió con error ${respuesta.status}`);
  }
  return respuesta.json();   // { id, nombre_auditorio, sede, aforo }
}

async function obtenerAuditoriosPorIds(ids, token) {
  const respuesta = await pedir(`/auditorios?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  return respuesta.json();
}
// Ejemplo de uso:
//   const respuesta = await pedir('/auditorios/3', token);
//   if (!respuesta) ...                   → ms-auditorios no respondió
//   if (respuesta.status === 404) ...     → no existe
//   const datos = await respuesta.json(); → el objeto (o el arreglo, con ?ids=)

module.exports = { pedir,obtenerAuditorio, obtenerAuditoriosPorIds };
