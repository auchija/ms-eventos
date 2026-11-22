// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y aplica la seguridad:
//   todas las rutas exigen token (401 sin él)
//   consultar (GET)            → cualquier rol autenticado
//   crear, modificar, eliminar → solo administrador (403 para los demás)
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/eventos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', requiereRol('administrador'), controller.crear);
router.put('/:id', requiereRol('administrador'), controller.actualizar);
router.delete('/:id', requiereRol('administrador'), controller.eliminar);

module.exports = router;
