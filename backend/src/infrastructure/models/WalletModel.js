const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WalletModel = sequelize.define('Wallet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    saldo: { type: DataTypes.FLOAT, defaultValue: 0.0, allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'FROZEN'), defaultValue: 'ACTIVE' },
    // user_id se agregará en las asociaciones
}, { timestamps: true });

module.exports = WalletModel;