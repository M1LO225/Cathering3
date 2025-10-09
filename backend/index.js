// Ruta: backend/index.js (Punto de Entrada del Servidor)

require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. Configuración de Infraestructura
const db = require('./src/infrastructure/config/database');
const SQLiteUserRepository = require('./src/infrastructure/repositories/SQLiteUserRepository');

// --- Componentes Existentes (Auth) ---
const authRoutes = require('./src/infrastructure/routes/auth.routes');
const AuthController = require('./src/infrastructure/controllers/AuthController');
const AuthMiddleware = require('./src/infrastructure/middlewares/AuthMiddleware');
const RegisterUser = require('./src/application/use-cases/RegisterUser'); // 🚨 Ya existe
const LoginUser = require('./src/application/use-cases/LoginUser');

// --- Componentes CRUD ---
const userRoutes = require('./src/infrastructure/routes/user.routes');
const GetAllUsers = require('./src/application/use-cases/GetAllUsers'); 
const UpdateUser = require('./src/application/use-cases/UpdateUser'); 
const DeleteUser = require('./src/application/use-cases/DeleteUser'); 

// --- INYECCIÓN DE DEPENDENCIAS ---

const userRepository = new SQLiteUserRepository(db);

// Casos de Uso de Autenticación (incluye RegisterUser)
const registerUser = new RegisterUser(userRepository); // 🚨 INSTANCIA EXISTENTE
const loginUser = new LoginUser(userRepository);
const authController = new AuthController(registerUser, loginUser);

// Casos de Uso de CRUD de Usuarios (TODOS)
const getAllUsers = new GetAllUsers(userRepository); 
const updateUser = new UpdateUser(userRepository);     
const deleteUser = new DeleteUser(userRepository);   

// --- CONFIGURACIÓN DE EXPRESS ---

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(bodyParser.json());

// A. Rutas de Autenticación (Públicas)
app.use('/api/auth', authRoutes(authController));

// B. Rutas de CRUD de Usuarios (PROTEGIDAS)
// 🚨 Le pasamos TAMBIÉN el caso de uso registerUser (la "C" de Create)
app.use('/api/users', userRoutes({ getAllUsers, updateUser, deleteUser, registerUser }, AuthMiddleware)); 

// C. Ejemplo de Ruta Protegida existente
app.get('/api/protected/data', AuthMiddleware, (req, res) => {
    res.json({ 
        message: `Welcome user ${req.userId}! This is protected data.`,
        data: "The secret content."
    });
});


// 5. Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});