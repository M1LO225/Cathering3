const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductModel = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING },
    precio: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }, // Validación de stock
    tiempo_prep: { type: DataTypes.INTEGER }, // En minutos
    imagen_url: { type: DataTypes.STRING }, // Ruta local del archivo
    // colegio_id se agregará en las asociaciones
}, { timestamps: true });

module.exports = ProductModel;