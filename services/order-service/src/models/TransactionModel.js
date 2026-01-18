module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        type: { 
            type: DataTypes.ENUM('TOPUP', 'PURCHASE', 'REFUND'), 
            allowNull: false 
        },
        amount: { 
            type: DataTypes.FLOAT, 
            allowNull: false 
        },
        description: { 
            type: DataTypes.STRING 
        }
    }, {
        timestamps: true
    });

    return Transaction;
};