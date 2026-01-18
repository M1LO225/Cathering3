const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (WalletModel, TransactionModel) => {
    const router = Router();
    
    // Importar e instanciar controlador
    const WalletController = require('../controllers/WalletController');
    const controller = new WalletController(WalletModel, TransactionModel);

    router.use(AuthMiddleware);

    // Obtener saldo
    router.get('/balance', controller.getBalance.bind(controller));
    
    // Recargar saldo (TopUp)
    router.post('/topup', controller.topUp.bind(controller));
    
    // Ver historial de transacciones
    router.get('/transactions', controller.getTransactions.bind(controller));

    return router;
};