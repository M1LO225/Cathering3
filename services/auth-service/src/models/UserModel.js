const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
            allowNull: true 
        },
        allergies: {
            type: DataTypes.TEXT, 
            defaultValue: '[]',
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true
    });

    return User;
};