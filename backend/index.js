require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. Configuración de Infraestructura
const db = require('./src/infrastructure/config/database');
const SQLiteUserRepository = require('./src/infrastructure/repositories/SQLiteUserRepository');
const SQLiteColegioRepository = require('./src/infrastructure/repositories/SQLiteColegioRepository');

// --- Componentes Existentes (Auth) ---
const authRoutes = require('./src/infrastructure/routes/auth.routes');
const AuthController = require('./src/infrastructure/controllers/AuthController');
const AuthMiddleware = require('./src/infrastructure/middlewares/AuthMiddleware');
const RegisterUser = require('./src/application/use-cases/RegisterUser'); 
const LoginUser = require('./src/application/use-cases/LoginUser');

// --- Componentes CRUD Usuarios ---
const userRoutes = require('./src/infrastructure/routes/user.routes');
const GetAllUsers = require('./src/application/use-cases/GetAllUsers'); 
const UpdateUser = require('./src/application/use-cases/UpdateUser'); 
const DeleteUser = require('./src/application/use-cases/DeleteUser'); 

// --- NUEVOS Componentes CRUD Colegio ---
const colegioRoutes = require('./src/infrastructure/routes/colegio.routes');
const ColegioController = require('./src/infrastructure/controllers/ColegioController');
const GetColegioDetails = require('./src/application/use-cases/GetColegioDetails');
const UpdateColegioDetails = require('./src/application/use-cases/UpdateColegioDetails');

// --- INYECCIÓN DE DEPENDENCIAS ---

// Repositorios
const userRepository = new SQLiteUserRepository(db);
const colegioRepository = new SQLiteColegioRepository(db);

// Casos de Uso de Autenticación
const registerUser = new RegisterUser(userRepository); 
const loginUser = new LoginUser(userRepository);
const authController = new AuthController(registerUser, loginUser);

// Casos de Uso de CRUD de Usuarios
const getAllUsers = new GetAllUsers(userRepository); 
const updateUser = new UpdateUser(userRepository);     
const deleteUser = new DeleteUser(userRepository);   

// Casos de Uso de CRUD de Colegio (NUEVOS)
const getColegioDetails = new GetColegioDetails(colegioRepository);
const updateColegioDetails = new UpdateColegioDetails(colegioRepository);
const colegioController = new ColegioController(getColegioDetails, updateColegioDetails);

// --- CONFIGURACIÓN DE EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); 
app.use(bodyParser.json());

// --- RUTAS ---

// A. Rutas de Autenticación (Públicas)
app.use('/api/auth', authRoutes(authController));

// B. Rutas de CRUD de Usuarios (Protegidas por Admin)
app.use('/api/users', userRoutes(
    { getAllUsers, updateUser, deleteUser, userRepository }, // Pasamos el repo para la creación
    AuthMiddleware
)); 

// C. Rutas de Gestión del Colegio (Protegidas por Admin)
app.use('/api/colegio', colegioRoutes(colegioController)); 

// D. Ruta de prueba protegida (Existente)
app.get('/api/protected/data', AuthMiddleware, (req, res) => {
    res.json({ 
        message: `Welcome user ${req.userId}! This is protected data.`,
        data: "The secret content.",
        userProfile: req.user // Muestra el perfil completo cargado por el middleware
    });
});

// 5. Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});