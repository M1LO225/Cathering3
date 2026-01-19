// services/auth-service/src/routes/auth.routes.js
const { Router } = require('express');

// Controladores
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

// Dependencias
const SQLiteUserRepository = require('../repositories/SQLiteUserRepository'); 
const EncryptService = require('../services/EncryptService');
const TokenService = require('../services/TokenService');
const RegisterUser = require('../use-cases/RegisterUser');
const LoginUser = require('../use-cases/LoginUser');
const UpdateUser = require('../use-cases/UpdateUser'); 
const AuthMiddlewareDef = require('../middlewares/AuthMiddleware');

module.exports = (UserModel, ColegioModel, sequelize) => {
    const router = Router();

    // 1. Iniciar Dependencias
    // Pasamos los 3 argumentos necesarios al repositorio
    const userRepository = new SQLiteUserRepository(UserModel, ColegioModel, sequelize);
    const encryptService = new EncryptService();
    const tokenService = new TokenService();

    const authMiddleware = AuthMiddlewareDef(userRepository, tokenService);

    // 2. Casos de Uso
    const registerUserUseCase = new RegisterUser(userRepository, encryptService);
    const loginUserUseCase = new LoginUser(userRepository, tokenService, encryptService);
    const updateUserUseCase = new UpdateUser(userRepository, encryptService);

    // 3. Controladores
    const authController = new AuthController(registerUserUseCase, loginUserUseCase);
    const userController = new UserController(userRepository, encryptService, updateUserUseCase);

    // --- RUTAS PÚBLICAS ---
    router.post('/login', authController.login.bind(authController));
    router.post('/register', authController.register.bind(authController));

    // --- RUTAS PROTEGIDAS (ADMINISTRACIÓN) ---
    router.get('/users', authMiddleware, userController.listUsers.bind(userController));
    router.get('/colegio', authMiddleware, userController.getColegio.bind(userController));
    router.put('/colegio', authMiddleware, userController.updateColegio.bind(userController));
    router.get('/allergies', authMiddleware, userController.getAllergies.bind(userController));
    router.put('/allergies', authMiddleware, userController.updateAllergies.bind(userController));
    
    // Crear Roles
    router.post('/users/cafeteria', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'cafeteria'));
    router.post('/users/estudiante', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'estudiante'));
    router.post('/users/personal', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'personal_academico'));

    // Actualizar y Eliminar
    router.put('/users/:id', authMiddleware, userController.update.bind(userController));
    router.delete('/users/:id', authMiddleware, userController.delete.bind(userController));

    // --- RUTAS UTILIDAD ---
    router.get('/me', authMiddleware, userController.getProfile.bind(userController));
    router.get('/allergies', authMiddleware, userController.getMyAllergies.bind(userController));
    router.put('/allergies', authMiddleware, userController.updateMyAllergies.bind(userController));
    router.get('/balance', authMiddleware, userController.getBalance.bind(userController));
    router.post('/balance/recharge', authMiddleware, userController.rechargeBalance.bind(userController));

    return router;
};