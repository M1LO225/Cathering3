const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (walletController) => {
    const router = Router();

    // Todas las rutas de billetera requieren estar logueado
    router.use(AuthMiddleware);

    // Obtener saldo actual
    router.get('/', walletController.getBalance.bind(walletController));

    // Recargar saldo
    router.post('/topup', walletController.topUp.bind(walletController));

    return router;
};