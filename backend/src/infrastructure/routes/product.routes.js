const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (productController) => {
    const router = Router();
    
    router.use(AuthMiddleware);

    router.get('/menu', productController.list.bind(productController)); 
    
    router.get('/', productController.list.bind(productController));
    
    router.get('/ingredients', productController.listIngredients.bind(productController));
    router.get('/student-menu', productController.listForStudent.bind(productController));

    router.post('/', isCafeteria, upload.single('image'), productController.create.bind(productController));
    
    router.delete('/:id', isCafeteria, productController.delete.bind(productController));
    
    return router;
};