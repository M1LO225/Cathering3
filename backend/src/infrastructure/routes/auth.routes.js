const { Router } = require('express');
const validateColegio = require('../middlewares/validateColegio'); 

module.exports = (authController) => {
    const router = Router();

    /**
       POST /api/auth/register
       Registra un nuevo Colegio Y su usuario Administrador.
       Valida el teléfono (dato sensible) antes de crear.
     */
    router.post(
        '/register', 
        validateColegio, // Requisito 1: Validación de dato sensible
        authController.register.bind(authController)
    );
    
    // POST /api/auth/login
    router.post('/login', authController.login.bind(authController));

    return router;
};