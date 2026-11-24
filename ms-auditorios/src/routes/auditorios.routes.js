// CAPA DE PRESENTACIÓN: rutas de auditorios (solo lectura, cualquier rol autenticado)
const { Router } = require('express');
const controller = require('../controllers/auditorios.controller');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                // todas las rutas exigen token

router.get('/', controller.listar);       // GET /auditorios  y  GET /auditorios?ids=1,3
router.get('/:id', controller.obtener);   // GET /auditorios/:id

module.exports = router;
