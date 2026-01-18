const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (OrderModel, WalletModel) => {
    const router = Router();
    
    // Necesitamos inyectar los modelos en el controlador manualmente si no usas DI en el controller
    // NOTA: Esto asume que adaptarás tu OrderController para recibir modelos, 
    // si no, simplemente impórtalos dentro del controller y borra los parámetros aquí.
    const OrderController = require('../controllers/OrderController');
    const controller = new OrderController(OrderModel, WalletModel); 

    router.use(AuthMiddleware);

    // Crear pedido
    router.post('/', controller.create.bind(controller));
    
    // Ver mis pedidos (El controller debe filtrar por req.user.id)
    router.get('/my-orders', controller.getMyOrders.bind(controller));
    
    // Ver pedidos entrantes (Para cocina/cafetería)
    router.get('/incoming', controller.getIncoming.bind(controller));
    
    // Actualizar estado del pedido
    router.put('/:id/status', controller.updateStatus.bind(controller));

    return router;
};