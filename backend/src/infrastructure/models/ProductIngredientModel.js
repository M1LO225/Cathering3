const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabla pivote explícita
const ProductIngredientModel = sequelize.define('ProductIngredient', {
    // Claves foráneas se definen en las asociaciones
}, { timestamps: false });

module.exports = ProductIngredientModel;