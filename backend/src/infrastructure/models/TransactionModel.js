const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionModel = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.ENUM('DEPOSIT', 'PURCHASE', 'REFUND'), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.STRING }, // Ej: "Recarga en caja", "Compra Pedido #123"
    // wallet_id se agregará en las asociaciones
}, { timestamps: true });

module.exports = TransactionModel;