const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ColegioModel = require('./ColegioModel');

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
        references: {
            model: ColegioModel,
            key: 'id'
        }
    }
}, {
    tableName: 'users',
    timestamps: true
});


ColegioModel.hasMany(UserModel, { foreignKey: 'colegio_id', as: 'usuarios' });
UserModel.belongsTo(ColegioModel, { foreignKey: 'colegio_id', as: 'colegio' });

module.exports = UserModel;