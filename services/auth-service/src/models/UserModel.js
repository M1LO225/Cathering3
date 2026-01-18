// services/auth-service/src/models/UserModel.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {}

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
            validate: { isEmail: true }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user'
        },
        colegio_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        saldo: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },

        allergies: {
            type: DataTypes.JSON, // Guardará algo como: [1, 4, 10]
            defaultValue: [] 
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true
    });

    return User;
};