// services/auth-service/src/routes/auth.routes.js
const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware'); // Asegúrate que la ruta sea correcta

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

module.exports = (UserModel, ColegioModel, sequelize, TransactionModel) => {
    const router = Router();

    // 1. Iniciar Dependencias
    const userRepository = new SQLiteUserRepository(UserModel, ColegioModel, sequelize);
    const encryptService = new EncryptService();
    const tokenService = new TokenService();

    // Nota: AuthMiddleware suele ser una función, verifica si necesitas instanciarlo así o usarlo directo
    const authMiddleware = AuthMiddlewareDef(userRepository, tokenService);

    // 2. Casos de Uso
    const registerUserUseCase = new RegisterUser(userRepository, encryptService);
    const loginUserUseCase = new LoginUser(userRepository, tokenService, encryptService);
    const updateUserUseCase = new UpdateUser(userRepository, encryptService);

    // 3. Controladores
    const authController = new AuthController(registerUserUseCase, loginUserUseCase);
    const userController = new UserController(userRepository, encryptService, updateUserUseCase, TransactionModel);

    // --- RUTAS PÚBLICAS ---
    router.post('/login', authController.login.bind(authController));
    router.post('/register', authController.register.bind(authController));

    // --- RUTAS PROTEGIDAS ---
    // (Admin / General)
    router.get('/users', authMiddleware, userController.listUsers.bind(userController));
    
    // Gestión del Colegio
    router.get('/colegio', authMiddleware, userController.getColegio.bind(userController));
    router.put('/colegio', authMiddleware, userController.updateColegio.bind(userController));
    
    // Creación de Roles
    router.post('/users/cafeteria', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'cafeteria'));
    router.post('/users/estudiante', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'estudiante'));
    router.post('/users/personal', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'personal_academico'));

    // Actualizar y Eliminar Usuarios
    router.put('/users/:id', authMiddleware, userController.update.bind(userController));
    router.delete('/users/:id', authMiddleware, userController.delete.bind(userController));

    // --- RUTAS DE UTILIDAD (PERFIL, ALERGIAS, BILLETERA) ---
    
    router.get('/me', authMiddleware, userController.getProfile.bind(userController));
    router.get('/allergies', authMiddleware, userController.getMyAllergies.bind(userController));
    router.post('/allergies', authMiddleware, userController.updateMyAllergies.bind(userController));
    // --- BILLETERA ---
    router.get('/balance', authMiddleware, userController.getBalance.bind(userController));
    router.post('/balance/recharge', authMiddleware, userController.rechargeBalance.bind(userController));

    return router;
};