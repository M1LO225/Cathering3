// services/auth-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// --- BASE DE DATOS (Solo Usuarios) ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './auth_database.sqlite', // DB Aislada
    logging: false
});

// --- IMPORTAR MODELO ---
const UserModelDefinition = require('./src/models/UserModel');
const User = UserModelDefinition(sequelize, DataTypes);

// --- INYECCIÓN DE DEPENDENCIAS (DIP - SOLID) ---
// Pasamos el modelo 'User' a las rutas para que el controlador no dependa 
// directamente de la importación del archivo, facilitando testing.
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes(User));


// Endpoint interno para validar tokens (Para otros microservicios)
app.get('/api/internal/validate', async (req, res) => {
    res.json({ status: 'Auth Service Online' });
});

// Sincronizar y Arrancar
sequelize.sync({ force: false }).then(() => {
    console.log('Auth DB Sincronizada');
    app.listen(PORT, () => {
        console.log(`Auth Service corriendo en puerto ${PORT}`);
    });
});