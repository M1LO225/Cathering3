const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItemModel = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    price_at_purchase: { type: DataTypes.FLOAT, allowNull: false },
    // Aquí guardamos productos sin ingredientes(Sin cebolla,etc)
    removed_ingredients: { type: DataTypes.STRING, defaultValue: '' }, 
    order_id: {type: DataTypes.INTEGER,allowNull: false},
    product_id: {type: DataTypes.INTEGER,allowNull: false},
}, { timestamps: false });

module.exports = OrderItemModel;