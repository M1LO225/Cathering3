// src/infrastructure/routes/auth.routes.js
const { Router } = require('express');

module.exports = (authController) => {
    const router = Router();

    // POST /api/auth/register
    router.post('/register', authController.register.bind(authController));
    
    // POST /api/auth/login
    router.post('/login', authController.login.bind(authController));

    return router;
};