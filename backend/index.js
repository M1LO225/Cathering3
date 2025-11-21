require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. Configuración de Infraestructura
// 'db' ahora es la instancia de Sequelize configurada en database.js
const db = require('./src/infrastructure/config/database'); 

const SequelizeUserRepository = require('./src/infrastructure/repositories/SQLiteUserRepository');
// Nota: Deberías refactorizar el repositorio de Colegio igual que hicimos con el de Usuario
const SequelizeColegioRepository = require('./src/infrastructure/repositories/SQLiteColegioRepository');

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

// --- Componentes CRUD Colegio ---
const colegioRoutes = require('./src/infrastructure/routes/colegio.routes');
const ColegioController = require('./src/infrastructure/controllers/ColegioController');
const GetColegioDetails = require('./src/application/use-cases/GetColegioDetails');
const UpdateColegioDetails = require('./src/application/use-cases/UpdateColegioDetails');

// --- INYECCIÓN DE DEPENDENCIAS ---

// Repositorios (Ya no necesitan 'db' en el constructor con Sequelize)
const userRepository = new SequelizeUserRepository(); 
const colegioRepository = new SequelizeColegioRepository();

// Casos de Uso de Autenticación
const registerUser = new RegisterUser(userRepository); 
const loginUser = new LoginUser(userRepository);
const authController = new AuthController(registerUser, loginUser);

// Casos de Uso de CRUD de Usuarios
const getAllUsers = new GetAllUsers(userRepository); 
const updateUser = new UpdateUser(userRepository);     
const deleteUser = new DeleteUser(userRepository);   

// Casos de Uso de CRUD de Colegio
const getColegioDetails = new GetColegioDetails(colegioRepository);
const updateColegioDetails = new UpdateColegioDetails(colegioRepository);
const colegioController = new ColegioController(getColegioDetails, updateColegioDetails);

// --- CONFIGURACIÓN DE EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(bodyParser.json());


app.use('/api/auth', authRoutes(authController));


app.use('/api/users', userRoutes(
    { getAllUsers, updateUser, deleteUser, userRepository }, 
    AuthMiddleware
)); 


app.use('/api/colegio', colegioRoutes(colegioController)); 


app.get('/api/protected/data', AuthMiddleware, (req, res) => {
    res.json({ 
        message: `Welcome user ${req.userId}! This is protected data.`,
        data: "The secret content.",
        userProfile: req.user 
    });
});


db.sync({ force: false })
  .then(() => {
      console.log("Base de datos sincronizada con Sequelize.");
      app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
      });
  })
  .catch((err) => {
      console.error("Error al sincronizar base de datos:", err);
  });