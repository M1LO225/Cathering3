// index.js (Punto de entrada del servidor)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Necesario para comunicar con React

// 1. Configuración de Infraestructura
const db = require('./src/infrastructure/config/database');
const SQLiteUserRepository = require('./src/infrastructure/repositories/SQLiteUserRepository');
const authRoutes = require('./src/infrastructure/routes/auth.routes');
const AuthController = require('./src/infrastructure/controllers/AuthController');
const AuthMiddleware = require('./src/infrastructure/middlewares/AuthMiddleware');

// 2. Casos de Uso de Aplicación
const RegisterUser = require('./src/application/use-cases/RegisterUser');
const LoginUser = require('./src/application/use-cases/LoginUser');

// --- INYECCIÓN DE DEPENDENCIAS ---

const userRepository = new SQLiteUserRepository(db);
const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository);
const authController = new AuthController(registerUser, loginUser);

// --- CONFIGURACIÓN DE EXPRESS ---

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir que el frontend (React) acceda al backend
app.use(cors()); 

// Middleware para parsear JSON
app.use(bodyParser.json());

// D. Rutas de Autenticación
app.use('/api/auth', authRoutes(authController));

// E. Ejemplo de Ruta Protegida (Requiere JWT)
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