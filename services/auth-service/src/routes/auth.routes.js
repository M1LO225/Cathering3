// services/auth-service/src/routes/auth.routes.js
const { Router } = require('express');

// 1. Importar el Controlador
const AuthController = require('../controllers/AuthController');

// 2. Importar Repositorio
const SQLiteUserRepository = require('../repositories/SQLiteUserRepository'); 

// 3. Importar Servicios Auxiliares
const EncryptService = require('../services/EncryptService');
const TokenService = require('../services/TokenService');

// 4. Importar Casos de Uso
const RegisterUser = require('../use-cases/RegisterUser');
const LoginUser = require('../use-cases/LoginUser');

// 5. IMPORTAR EL MIDDLEWARE (Nuevo)
const AuthMiddlewareDef = require('../middlewares/AuthMiddleware');

// --- FUNCIÓN PRINCIPAL QUE RECIBE EL MODELO SEQUELIZE ---
module.exports = (UserModel) => {
    const router = Router();

    // A. Inicializar Capa de Datos
    const userRepository = new SQLiteUserRepository(UserModel);

    // B. Inicializar Servicios
    const encryptService = new EncryptService();
    const tokenService = new TokenService();

    // C. INICIALIZAR MIDDLEWARE (Inyección de Dependencias)
    const authMiddleware = AuthMiddlewareDef(userRepository, tokenService);

    // D. Inicializar Casos de Uso
    const registerUserUseCase = new RegisterUser(userRepository, encryptService);
    const loginUserUseCase = new LoginUser(userRepository, tokenService, encryptService);

    // E. Inicializar Controlador
    const authController = new AuthController(
        registerUserUseCase, 
        loginUserUseCase, 
        userRepository
    );

    // --- DEFINICIÓN DE RUTAS PÚBLICAS ---
    router.post('/register', authController.register.bind(authController));
    router.post('/login', authController.login.bind(authController));
    
    // Ver mis alergias
    router.get(
        '/allergies', 
        authMiddleware,
        authController.getMyAllergies.bind(authController)
    );

    // Actualizar mis alergias
    router.put(
        '/allergies', 
        authMiddleware,
        authController.updateMyAllergies.bind(authController)
    );

    return router;
};