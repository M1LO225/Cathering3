const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

// Importamos la clase del controlador
const ProductController = require('../controllers/ProductController');

module.exports = (ProductModel) => {
    const router = Router();
    
    // Instanciamos el controlador pasándole el modelo
    const controller = new ProductController(ProductModel);

    // --- RUTAS PÚBLICAS ---
    // CAMBIO CLAVE: Usamos .getAll en lugar de .list
    router.get('/menu', controller.getAll.bind(controller)); 
    router.get('/', controller.getAll.bind(controller));
    
    // Para el menú de estudiantes, por ahora usamos getAll también para que no falle
    router.get('/student-menu', controller.getAll.bind(controller));

    // --- RUTAS PROTEGIDAS ---
    router.post(
        '/', 
        AuthMiddleware, 
        isCafeteria, 
        upload.single('image'), 
        controller.create.bind(controller)
    );
    
    router.delete(
        '/:id', 
        AuthMiddleware, 
        isCafeteria, 
        controller.delete.bind(controller)
    );
    
    return router;
};