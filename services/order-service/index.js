// order-service/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DB
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './orders_database.sqlite',
    logging: false
});

// 2. IMPORTAR DEFINICIONES DE MODELOS
// (Asegúrate de que las rutas sean correctas según tu estructura de carpetas)
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
// Ordenes e Items
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });

// Billetera y Transacciones
Wallet.hasMany(Transaction, { as: 'transactions', foreignKey: 'walletId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

// 5. CONFIGURAR RUTAS
// Importamos los creadores de rutas
const createOrderRoutes = require('./src/routes/order.routes'); // Asegúrate que este archivo exista y exporte una función
const createWalletRoutes = require('./src/routes/wallet.routes');

// Inyectamos modelos necesarios a las rutas de Órdenes (Ahora Order necesita Wallet para cobrar)
// NOTA: Pasamos Wallet a las rutas de Order para poder validar saldo en el OrderController
app.use('/api/orders', createOrderRoutes(Order, OrderItem, Wallet)); 

// Inyectamos modelos a las rutas de Billetera
app.use('/api/wallet', createWalletRoutes(Wallet));

// 6. INICIAR SERVIDOR
sequelize.sync({ force: false }).then(() => {
    console.log('Base de datos sincronizada (Orders + Wallets)');
    app.listen(PORT, () => {
        console.log(`Order Service corriendo en el puerto ${PORT}`);
    });
}).catch(err => console.error("Error al iniciar DB:", err));