// services/auth-service/src/routes/auth.routes.js
const { Router } = require('express');

// Importamos AMBOS controladores
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

// Dependencias y Repositorios
const SQLiteUserRepository = require('../repositories/SQLiteUserRepository'); 
const EncryptService = require('../services/EncryptService');
const TokenService = require('../services/TokenService');
const RegisterUser = require('../use-cases/RegisterUser');
const LoginUser = require('../use-cases/LoginUser');
const AuthMiddlewareDef = require('../middlewares/AuthMiddleware');

module.exports = (UserModel) => {
    const router = Router();

    // 1. Instanciar Servicios Base
    const userRepository = new SQLiteUserRepository(UserModel);
    const encryptService = new EncryptService();
    const tokenService = new TokenService();

    const authMiddleware = AuthMiddlewareDef(userRepository, tokenService);

    // 2. Instanciar Casos de Uso
    const registerUserUseCase = new RegisterUser(userRepository, encryptService);
    const loginUserUseCase = new LoginUser(userRepository, tokenService, encryptService);

    // 3. Instanciar Controladores
    // AuthController: Solo necesita casos de uso de registro y login
    const authController = new AuthController(registerUserUseCase, loginUserUseCase);
    
    // UserController: Necesita repositorio directo y caso de uso de registro (para crear admin)
    const userController = new UserController(userRepository, registerUserUseCase);

    // --- RUTAS PÚBLICAS (Usan AuthController) ---
    router.post('/register', authController.register.bind(authController));
    router.post('/login', authController.login.bind(authController));

    // --- RUTAS PROTEGIDAS (Usan UserController) ---
    
    // Perfil y Gestión
    router.get('/me', authMiddleware, userController.getProfile.bind(userController));
    router.get('/users', authMiddleware, userController.getUsers.bind(userController));
    
    // Creación administrativa (Admin panel)
    router.post('/users/:role', authMiddleware, userController.createUser.bind(userController));

    // Alergias
    router.get('/allergies', authMiddleware, userController.getMyAllergies.bind(userController));
    router.put('/allergies', authMiddleware, userController.updateMyAllergies.bind(userController));
    
    // Saldo
    router.get('/balance', authMiddleware, userController.getBalance.bind(userController));
    router.post('/balance/recharge', authMiddleware, userController.rechargeBalance.bind(userController));

    return router;
};