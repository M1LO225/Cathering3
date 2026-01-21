// services/catalog-service/src/models/ColegioModel.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Colegio extends Model {}

    Colegio.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // --- CORRECCIÓN: USAR NOMBRES EN ESPAÑOL (Como en la DB) ---
        nombre: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        direccion: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        telefono: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        ciudad: { 
            type: DataTypes.STRING,
            allowNull: true
        },
        provincia: { 
            type: DataTypes.STRING,
            allowNull: true
        }
        // ------------------------------------------------------------
    }, {
        sequelize,
        modelName: 'Colegio',
        tableName: 'colegios', // Aseguramos que apunte a la tabla existente
        timestamps: true // Para createdAt y updatedAt
    });

    return Colegio;
};