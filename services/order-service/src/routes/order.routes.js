// order-service/src/routes/order.routes.js
const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const OrderController = require('../controllers/OrderController');

// Aceptamos 3 modelos ahora
module.exports = (OrderModel, OrderItemModel, WalletModel) => {
    const router = Router();
    
    // Inyectamos los 3 modelos
    const controller = new OrderController(OrderModel, OrderItemModel, WalletModel); 

    router.use(AuthMiddleware);

    router.post('/', controller.createOrder.bind(controller));
    router.get('/my-orders', controller.getMyOrders.bind(controller));
    router.get('/incoming', controller.getIncomingOrders.bind(controller)); // Ojo con el nombre del método
    router.put('/:id/status', controller.updateStatus.bind(controller));

    return router;
};