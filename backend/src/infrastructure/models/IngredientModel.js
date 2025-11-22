const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IngredientModel = sequelize.define('Ingredient', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { timestamps: false });

module.exports = IngredientModel;