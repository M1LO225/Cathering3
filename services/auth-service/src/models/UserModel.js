// services/auth-service/src/models/UserModel.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        // ... id, username, password, role, etc ...
        // Agrega esto:
        allergies: {
            type: DataTypes.TEXT, // Guardaremos JSON string: "['Maní', 'Leche']"
            defaultValue: '[]'
        },
        // ... colegio_id, saldo ...
    });

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        // MANTENEMOS TU CAMPO ORIGINAL 'passwordHash'
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'ESTUDIANTE',
            allowNull: false
        },
        colegio_id: {
            type: DataTypes.INTEGER,
            allowNull: true // Puede ser nulo si es SuperAdmin o aún no se asigna
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true
    });


    return User;
};