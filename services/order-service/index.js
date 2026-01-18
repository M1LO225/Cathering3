require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// --- BASE DE DATOS PROPIA ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './orders_database.sqlite',
    logging: false
});

// --- IMPORTAR MODELOS ---
const OrderDef = require('./src/models/OrderModel');
const OrderItemDef = require('./src/models/OrderItemModel');
const WalletDef = require('./src/models/WalletModel');
const TransactionDef = require('./src/models/TransactionModel');
// const OrderItemDef = require('./src/models/OrderItemModel'); 

const Order = OrderDef(sequelize, DataTypes);
const OrderItem = OrderItemDef(sequelize, DataTypes);
const Wallet = WalletDef(sequelize, DataTypes);
const Transaction = TransactionDef(sequelize, DataTypes);
// const OrderItem = OrderItemDef(sequelize, DataTypes);

// --- RELACIONES (Sin Usuarios) ---
Wallet.hasMany(Transaction);
Transaction.belongsTo(Wallet);
// Relación Pedido - Billetera (Opcional si pagan con saldo)
Order.belongsTo(Wallet, { foreignKey: 'walletId', allowNull: true });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
// --- RUTAS ---
const orderRoutes = require('./src/routes/order.routes');
const walletRoutes = require('./src/routes/wallet.routes');

app.use('/api/orders', orderRoutes(Order, Wallet)); // Pasamos Wallet por si hay pagos
app.use('/api/wallet', walletRoutes(Wallet, Transaction));

sequelize.sync({ force: false }).then(() => {
    console.log('Order DB Sincronizada');
    app.listen(PORT, () => {
        console.log(`Order Service corriendo en puerto ${PORT}`);
    });
});