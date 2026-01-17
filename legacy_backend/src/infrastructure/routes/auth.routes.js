const { Router } = require('express');
const validateColegio = require('../middlewares/validateColegio'); 
const AuthMiddleware = require('../middlewares/AuthMiddleware');

module.exports = (authController) => {
    const router = Router();

    /**
       POST /api/auth/register
       Registra un nuevo Colegio Y su usuario Administrador.
       Valida el teléfono (dato sensible) antes de crear.
     */
    router.post('/register', validateColegio, authController.register.bind(authController));
    // POST /api/auth/login
    router.post('/login', authController.login.bind(authController));
    router.get('/allergies', AuthMiddleware, authController.getMyAllergies.bind(authController));
    router.post('/allergies', AuthMiddleware, authController.updateMyAllergies.bind(authController));

    return router;
};