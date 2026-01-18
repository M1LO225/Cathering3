// services/catalog-service/src/models/ColegioModel.js
module.exports = (sequelize, DataTypes) => {
    const Colegio = sequelize.define('Colegio', {
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

    return Colegio;
};