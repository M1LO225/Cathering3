const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const ProductController = require('../controllers/ProductController');

module.exports = (ProductModel, ColegioModel) => {
    const router = Router();
    const controller = new ProductController(ProductModel, ColegioModel);

    // GET / 
    router.get('/ingredients', AuthMiddleware, controller.getIngredients.bind(controller));
    router.get('/', AuthMiddleware, controller.getAll.bind(controller));

    // POST /
    router.post(
        '/', 
        AuthMiddleware, 
        isCafeteria, 
        upload.single('image'), 
        controller.create.bind(controller)
    );
    
    // DELETE /:id
    router.delete(
        '/:id', 
        AuthMiddleware, 
        isCafeteria, 
        controller.delete.bind(controller)
    );
    
    return router;
};