const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (walletController) => {
    const router = Router();
    router.use(AuthMiddleware);

    router.get('/', walletController.getBalance.bind(walletController));
    router.post('/topup', walletController.topUp.bind(walletController));

    return router;
};