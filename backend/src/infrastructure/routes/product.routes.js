const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (productController) => {
    const router = Router();

    // Todas las rutas requieren autenticación (estar logueado)
    router.use(AuthMiddleware);

    // GET /api/products -> Ver menú (Accesible para Estudiante y Cafetería)
    router.get('/', productController.list.bind(productController));

    // POST /api/products -> Crear plato (Solo Cafetería)
    // Nota: 'image' es el nombre del campo del formulario frontend
    router.post('/', isCafeteria, upload.single('image'), productController.create.bind(productController));

    return router;
};