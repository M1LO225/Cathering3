// src/config/db.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// IMPORTAR MODELOS
const OrderModelDef = require('../models/OrderModel');
const OrderItemModelDef = require('../models/OrderItemModel');
const WalletModelDef = require('../models/WalletModel');
const TransactionModelDef = require('../models/TransactionModel');

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
        dialectOptions: isProduction ? { ssl: { require: true, rejectUnauthorized: false } } : {}
    }
);

// INICIALIZAR MODELOS
const Order = OrderModelDef(sequelize, DataTypes);
const OrderItem = OrderItemModelDef(sequelize, DataTypes);
const Wallet = WalletModelDef(sequelize, DataTypes);
const Transaction = TransactionModelDef(sequelize, DataTypes);

// DEFINIR RELACIONES
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });

Wallet.hasMany(Transaction, { as: 'transactions', foreignKey: 'walletId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

module.exports = { sequelize, Order, OrderItem, Wallet, Transaction };