const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ColegioModel = sequelize.define('Colegio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING
    },
    telefono: {
        type: DataTypes.STRING
        
    },
    ciudad: {
        type: DataTypes.STRING
    },
    provincia: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'colegios', 
    timestamps: true 
});

module.exports = ColegioModel;