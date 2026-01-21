require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DB
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
                rejectUnauthorized: false
            }
        } : {}
    }
);

// 2. IMPORTAR DEFINICIONES DE MODELOS
const OrderModelDef = require('./src/models/OrderModel');
const OrderItemModelDef = require('./src/models/OrderItemModel');
const WalletModelDef = require('./src/models/WalletModel');
const TransactionModelDef = require('./src/models/TransactionModel');

// 3. INICIALIZAR MODELOS
const Order = OrderModelDef(sequelize, DataTypes);
const OrderItem = OrderItemModelDef(sequelize, DataTypes);
const Wallet = WalletModelDef(sequelize, DataTypes);
const Transaction = TransactionModelDef(sequelize, DataTypes);

// 4. DEFINIR RELACIONES
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });

Wallet.hasMany(Transaction, { as: 'transactions', foreignKey: 'walletId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

// 5. CONFIGURAR RUTAS
const createOrderRoutes = require('./src/routes/order.routes');
const createWalletRoutes = require('./src/routes/wallet.routes');

app.use('/api/orders', createOrderRoutes(Order, OrderItem, Wallet)); 

// --- CORRECCIÓN AQUÍ: Pasamos Wallet Y Transaction ---
app.use('/api/wallet', createWalletRoutes(Wallet, Transaction));
// ----------------------------------------------------

// 6. INICIAR SERVIDOR
sequelize.sync({ force: false }).then(() => {
    console.log('Base de datos sincronizada (Orders + Wallets)');
    app.listen(PORT, () => {
        console.log(`Order Service corriendo en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar DB:', err);
});