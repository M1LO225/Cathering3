const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (productController) => {
    const router = Router();

    // Rutas Públicas (Menú) - No requieren Auth
    router.get('/menu', productController.list.bind(productController)); 
    router.get('/', productController.list.bind(productController));
    router.get('/ingredients', productController.listIngredients.bind(productController)); // Si tienes este método
    router.get('/student-menu', productController.listForStudent.bind(productController)); // Si tienes este método

    // Rutas Privadas (Gestión) - Requieren Auth y Cafeteria
    router.post('/', 
        AuthMiddleware, 
        isCafeteria, 
        upload.single('image'), 
        productController.create.bind(productController)
    );
    
    router.delete('/:id', 
        AuthMiddleware, 
        isCafeteria, 
        productController.delete.bind(productController)
    );
    
    return router;
};