// services/auth-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Importar definiciones de modelos
const UserModelDef = require('./src/models/UserModel');
const ColegioModelDef = require('./src/models/ColegioModel');
const TransactionModelDef = require('./src/models/TransactionModel');
const startPaymentWorker = require('./src/workers/paymentWorker');

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Configurar Base de Datos
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'cateringdb',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || null,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: isProduction ? 'postgres' : 'sqlite',
        storage: isProduction ? null : './database.sqlite',
        logging: false,
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false // Necesario para RDS en algunos modos
            }
        } : {}
    }
);

// 2. Inicializar Modelos
const UserModel = UserModelDef(sequelize, DataTypes);
const ColegioModel = ColegioModelDef(sequelize, DataTypes);
const TransactionModel = TransactionModelDef(sequelize, DataTypes);

// 3. Definir Relaciones
UserModel.hasOne(ColegioModel, { foreignKey: 'admin_user_id' });
ColegioModel.belongsTo(UserModel, { foreignKey: 'admin_user_id' });
UserModel.hasMany(TransactionModel, { foreignKey: 'userId', as: 'transactions' });
TransactionModel.belongsTo(UserModel, { foreignKey: 'userId' });

// 4. Sincronizar Base de Datos
sequelize.sync()
    .then(() => {
        console.log('Base de datos sincronizada');
        
        // INICIAR EL WORKER SQS DESPUÉS DE CONECTAR A LA DB
        if (process.env.SQS_WALLET_URL) {
            startPaymentWorker(UserModel, TransactionModel); 
        }
    })
    .catch(err => console.error('Error al sincronizar DB:', err));

// 5. Configurar Rutas
app.use('/', authRoutes(UserModel, ColegioModel, sequelize, TransactionModel));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth Service corriendo en puerto ${PORT}`);
});