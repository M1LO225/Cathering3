// services/auth-service/src/routes/auth.routes.js
const { Router } = require('express');

const AuthController = require('../controllers/AuthController');
const SQLiteUserRepository = require('../repositories/SQLiteUserRepository'); 
const EncryptService = require('../services/EncryptService');
const TokenService = require('../services/TokenService');
const RegisterUser = require('../use-cases/RegisterUser');
const LoginUser = require('../use-cases/LoginUser');
const AuthMiddlewareDef = require('../middlewares/AuthMiddleware');

module.exports = (UserModel) => {
    const router = Router();

    // Iniciar dependencias
    const userRepository = new SQLiteUserRepository(UserModel);
    const encryptService = new EncryptService();
    const tokenService = new TokenService();

    const authMiddleware = AuthMiddlewareDef(userRepository, tokenService);

    const registerUserUseCase = new RegisterUser(userRepository, encryptService);
    const loginUserUseCase = new LoginUser(userRepository, tokenService, encryptService);

    const authController = new AuthController(registerUserUseCase, loginUserUseCase, userRepository);

    // Rutas
    router.post('/register', authController.register.bind(authController));
    router.post('/login', authController.login.bind(authController));
    
    // Alergias
    router.get('/allergies', authMiddleware, authController.getMyAllergies.bind(authController));
    router.put('/allergies', authMiddleware, authController.updateMyAllergies.bind(authController));

    return router;
};