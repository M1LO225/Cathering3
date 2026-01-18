// services/auth-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());


app.use((req, res, next) => {
    console.log(`📨 Auth Service recibió: ${req.method} ${req.url}`);
    next();
});


const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './auth_database.sqlite', // Esto creará un archivo nuevo en la raíz de la carpeta
    logging: false
});

// --- IMPORTAR MODELO ---
// Asegúrate de que esta ruta apunte a donde tienes tu UserModel.js
const UserModelDefinition = require('./src/models/UserModel'); 
const User = UserModelDefinition(sequelize, DataTypes);

// --- IMPORTAR RUTAS ---
const authRoutes = require('./src/routes/auth.routes');

// --- DEFINICIÓN DE RUTAS ---
// Usamos '/' porque el Gateway ya filtró la ruta
app.use('/', authRoutes(User));

// --- ARRANQUE ---
sequelize.sync({ force: false }) 
    .then(() => {
        console.log('Auth DB Sincronizada (SQLite)');
        app.listen(PORT, () => {
            console.log(`Auth Service corriendo en puerto ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });