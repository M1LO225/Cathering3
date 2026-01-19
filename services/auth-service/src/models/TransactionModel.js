const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {}

    Transaction.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false }, // 'TOPUP', 'PURCHASE'
        description: { type: DataTypes.STRING },
        userId: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions'
    });

    return Transaction;
};