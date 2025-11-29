const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');

module.exports = (orderController) => {
    const router = Router();
    router.use(AuthMiddleware);

    // Crear pedido (Cualquier usuario autenticado)
    router.post('/', orderController.create.bind(orderController));

    // Ver pedidos entrantes (Solo Cafetería)
    router.get('/incoming', isCafeteria, orderController.listIncoming.bind(orderController));

    return router;
};