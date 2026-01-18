const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserModel = sequelize.define('User', {
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

    }
}, {
    tableName: 'users',
    timestamps: true
});


module.exports = UserModel;