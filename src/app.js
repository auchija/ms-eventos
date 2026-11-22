// =====================================================================
// Configuración de la aplicación Express.
// Aquí se registran los middlewares, las rutas y el manejo de errores.
// El orden importa: Express los ejecuta de arriba hacia abajo.
// =====================================================================
const express = require('express');
const eventosRoutes = require('./routes/eventos.routes');

const app = express();

// REGISTRO DE PETICIONES: imprime en la terminal método, ruta y código de respuesta.
// Va de PRIMERO para que registre todas las peticiones (incluso las de error).
// 'finish' se dispara cuando la respuesta ya se envió: ahí ya se conoce el código.
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl} → ${res.statusCode}`);
  });
  next();
});

// Convierte el cuerpo JSON de la petición en un objeto (req.body)
app.use(express.json());

// Endpoint de salud (público): permite verificar que el microservicio está vivo
app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-eventos', estado: 'ok' });
});

// Rutas del recurso. Todas las URIs de este microservicio empiezan por /eventos
app.use('/eventos', eventosRoutes);

// Cualquier otra ruta: 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo centralizado de errores: todo HttpError lanzado en cualquier capa llega aquí
// (Express 5 captura también los errores de las funciones async)
app.use((err, req, res, next) => {
  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message, detalles: err.detalles });
});

module.exports = app;
