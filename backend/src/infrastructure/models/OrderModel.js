const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderModel = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'PAID', 'COMPLETED'), defaultValue: 'PENDING' },
    payment_method: { type: DataTypes.STRING }, // 'CARD', 'PAYPAL'
}, { timestamps: true });

module.exports = OrderModel;