// services/auth-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');

const sequelize = require('./src/config/database'); // DB Config
const UserModelDef = require('./src/models/UserModel');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Iniciar Modelo
const User = UserModelDef(sequelize, DataTypes);

// Rutas
app.use('/api/auth', authRoutes(User));
app.get('/api/health', (req, res) => res.json({ status: 'Auth Service Online' }));

// Sincronizar y Arrancar
sequelize.sync({ force: false })
    .then(() => {
        console.log('Auth DB Sincronizada (SQLite)');
        app.listen(PORT, () => {
            console.log(`Auth Service corriendo en puerto ${PORT}`);
        });
    })
    .catch(err => console.error('Error DB:', err));