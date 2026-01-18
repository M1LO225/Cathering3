const { Router } = require('express');
const AuthController = require('../controllers/AuthController'); // Tu controlador viejo

// Wrapper para inyección de dependencias
module.exports = (UserModel) => {
    const router = Router();
    const controller = new AuthController();

    router.post('/login', controller.login);
    router.post('/register', controller.register);
    
    return router;
};